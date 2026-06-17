"""
Build a real on-device material classifier and export it to TensorFlow Lite.

Produces:  ../mobile_flutter/assets/models/material_classifier.tflite

Architecture
------------
- Input:  [1, 224, 224, 3] float32, RGB, values in 0..1  (matches the Dart
  preprocessing in lib/cv/material_classifier.dart).
- A Rescaling layer maps 0..1 -> -1..1 to feed MobileNetV2 correctly.
- Backbone: MobileNetV2 (alpha=0.35) with ImageNet weights — small + fast,
  good for real-time phone inference.
- Head: GlobalAveragePooling -> Dropout -> Dense(6, softmax).
- Output: [1, 6] probabilities, in the same class order as labels.txt:
      vinyl_banner, reusable_cup, lanyard, foam_core_sign, carpet_tile, cardboard

NOTE ON ACCURACY
----------------
The backbone uses pretrained ImageNet features, but the 6-class head is not
fine-tuned on a labeled stadium-material dataset (none is bundled here). So this
is a *real, runnable* CV model with correct I/O wiring; for production accuracy,
fine-tune the head on real photos of each material (see fine_tune() below) and
re-export. The Flutter app will pick up the new .tflite automatically.
"""

import os
import numpy as np
import tensorflow as tf

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.normpath(
    os.path.join(HERE, "..", "mobile_flutter", "assets", "models")
)
MODEL_PATH = os.path.join(ASSETS_DIR, "material_classifier.tflite")
LABELS_PATH = os.path.join(ASSETS_DIR, "labels.txt")

IMG_SIZE = 224
SEED = 42


def load_labels():
    with open(LABELS_PATH, "r") as f:
        labels = [ln.strip() for ln in f if ln.strip()]
    if not labels:
        raise RuntimeError(f"No labels found in {LABELS_PATH}")
    return labels


def build_model(num_classes):
    tf.random.set_seed(SEED)
    inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3), name="image")
    # App feeds 0..1; MobileNetV2 expects -1..1.
    x = tf.keras.layers.Rescaling(scale=2.0, offset=-1.0)(inputs)
    backbone = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
        alpha=0.35,
    )
    backbone.trainable = False
    x = backbone(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(
        num_classes,
        activation="softmax",
        name="material",
    )(x)
    model = tf.keras.Model(inputs, outputs, name="material_classifier")
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def fine_tune(model, data_dir, epochs=10):
    """Optional: fine-tune on a folder dataset organized as
    data_dir/<class_label>/*.jpg  (class_label must match labels.txt).
    Call manually when you have real images; not run by default.
    """
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        labels="inferred",
        label_mode="categorical",
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=16,
        seed=SEED,
    )
    normalize = tf.keras.layers.Rescaling(1.0 / 255)
    train_ds = train_ds.map(lambda x, y: (normalize(x), y))
    model.fit(train_ds, epochs=epochs)
    return model


def export_tflite(model):
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float16]
    tflite_model = converter.convert()
    os.makedirs(ASSETS_DIR, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        f.write(tflite_model)
    return len(tflite_model)


def sanity_check():
    interp = tf.lite.Interpreter(model_path=MODEL_PATH)
    interp.allocate_tensors()
    inp = interp.get_input_details()[0]
    out = interp.get_output_details()[0]
    dummy = np.random.rand(1, IMG_SIZE, IMG_SIZE, 3).astype(np.float32)
    interp.set_tensor(inp["index"], dummy)
    interp.invoke()
    probs = interp.get_tensor(out["index"])[0]
    return inp["shape"].tolist(), out["shape"].tolist(), probs


def main():
    labels = load_labels()
    print(f"Classes ({len(labels)}): {labels}")
    model = build_model(len(labels))
    model.summary()
    size = export_tflite(model)
    in_shape, out_shape, probs = sanity_check()
    print("\n=== Export complete ===")
    print(f"Wrote: {MODEL_PATH}")
    print(f"Size:  {size/1024:.1f} KB")
    print(f"Input shape:  {in_shape}")
    print(f"Output shape: {out_shape}")
    print(f"Sample output sums to {probs.sum():.4f} (softmax OK)")
    top = int(np.argmax(probs))
    print(f"Top class on random input: {labels[top]} ({probs[top]*100:.1f}%)")


if __name__ == "__main__":
    main()
