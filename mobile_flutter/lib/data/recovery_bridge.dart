import 'dart:convert';

import 'package:http/http.dart' as http;

/// Public pub/sub relay (ntfy.envs.net) used to bridge the on-phone worker app to the
/// web command center.
///
/// The web laptop's corporate firewall blocks inbound connections, so the phone
/// can't reach it directly over the LAN. Instead both sides talk to this relay
/// using only OUTBOUND HTTPS:
///   - the phone POSTs an accepted recovery to https://ntfy.envs.net/<topic>
///   - the web `/api/recovery` route polls that same topic and lights up every
///     Biltmore-reactive screen.
///
/// The topic must match `NTFY_TOPIC` in src/app/api/recovery/route.ts.
const String kNtfyBase = 'https://ntfy.envs.net';
const String kNtfyTopic = 'materialops-biltmore-7q2x9k';

/// Maps a confirmed detection label to the web app's `SpotKind` vocabulary so
/// the command center can build the right Biltmore field drop.
String webKindForLabel(String label) {
  final l = label.toLowerCase();
  if (l.contains('lanyard')) return 'lanyards';
  if (l.contains('cup')) return 'cups';
  if (l.contains('bottle')) return 'bottles';
  if (l.contains('banner')) return 'banner';
  if (l.contains('carpet')) return 'carpet';
  if (l.contains('cardboard') || l.contains('box')) return 'cardboard';
  if (l.contains('compost') || l.contains('organic') || l.contains('food')) {
    return 'organics';
  }
  return 'other';
}

/// Posts an accepted recovery to the ntfy relay so every Biltmore-reactive
/// screen (maps, glowing markers, panels) lights up live on the web dashboard.
///
/// Best-effort: network failures are swallowed so the on-phone worker flow is
/// never blocked. Returns true on a 2xx response.
Future<bool> postRecovery({required String item, String? kind}) async {
  try {
    final uri = Uri.parse('$kNtfyBase/$kNtfyTopic');
    final res = await http
        .post(
          uri,
          headers: const {'Content-Type': 'application/json'},
          body: jsonEncode({
            'kind': kind ?? webKindForLabel(item),
            'item': item,
          }),
        )
        .timeout(const Duration(seconds: 5));
    return res.statusCode >= 200 && res.statusCode < 300;
  } catch (_) {
    return false;
  }
}
