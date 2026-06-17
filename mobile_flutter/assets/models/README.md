# On-device material classifier model

Drop a trained image-classification model here to enable **live** computer-vision
material detection on the Scan & Group screen:

```
assets/models/material_classifier.tflite   <-- your TFLite model
assets/models/labels.txt                    <-- one class label per line (provided)
```

## Expected model format

- **Type:** TensorFlow Lite image classifier (`.tflite`)
- **Input:** `[1, H, W, 3]` float32, RGB, values normalized to `0..1`
  (square input such as `224x224` is auto-detected from the model).
- **Output:** `[1, numClasses]` logits or probabilities. A softmax is applied
  in-app, so either works.
- **Labels:** `labels.txt` must list classes in the **same order** as the model
  output, one per line. The current labels map to the recovery catalog in
  `lib/cv/material_catalog.dart`:

  ```
  vinyl_banner
  reusable_cup
  lanyard
  foam_core_sign
  carpet_tile
  cardboard
  ```

## Behaviour without a model

If `material_classifier.tflite` is **absent** (the default), the app runs in
**demo/mock mode**: the Scan & Group screen shows a realistic stadium scene with
two detections (Reusable Cups + Vinyl Banner) so the flow is fully demoable. As
soon as a valid `.tflite` lands here, the app automatically switches to real
on-device inference on live camera frames — no code changes required.

## Training a quick model

You can produce a compatible model with Teachable Machine (export → TensorFlow
Lite → Floating point) or with `tf.keras` + `MobileNetV2` and
`TFLiteConverter`. Keep the class order in sync with `labels.txt`.
