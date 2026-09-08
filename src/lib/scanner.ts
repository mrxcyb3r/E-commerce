// QR / passcode scanning abstraction for the in-store selling flow.
//
// Interface-only by design: the workshop can swap the active source
// (manual passcode, camera QR scanning, future hardware barcode scanners)
// without touching the sale page. No hardware assumptions are made here —
// a camera adapter reports availability=false until a real implementation
// (e.g. a browser camera + QR decode lib) is supplied behind this seam.

export type ScannerKind = 'passcode' | 'camera' | 'barcode';

export interface ScannerResult {
  kind: ScannerKind;
  /** Raw scanned/typed value: a v1 QR payload or a bare passcode. */
  raw: string;
  /** Normalized passcode extracted from the raw value (QR decoded). */
  code: string;
  /** True when the raw value carried a QR envelope. */
  fromQr: boolean;
}

export interface SessionScannerAdapter {
  kind: ScannerKind;
  /** Whether this hardware/input source is usable in the current environment. */
  available: boolean;
  label: string;
  /** Begin listening. onScan fires per successful read. */
  start: (onScan: (result: ScannerResult) => void) => void;
  /** Stop listening and release any captures. */
  stop: () => void;
}

/**
 * Feed a decoded QR payload (base64url JSON from types/buySession.ts) or a
 * bare passcode into the scanner pipeline and extract the canonical code.
 */
export function decodeScanPayload(raw: string, kind: ScannerKind): ScannerResult {
  const trimmed = (raw || '').trim();
  const qr = decodeQrEnvelope(trimmed);
  if (qr) {
    return { kind, raw: trimmed, code: String(qr.code).toUpperCase(), fromQr: true };
  }
  return { kind, raw: trimmed, code: trimmed.toUpperCase(), fromQr: false };
}

function decodeQrEnvelope(value: string): { code: string } | null {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.code === 'string' && parsed.v && parsed.cs) {
      return { code: parsed.code };
    }
    return null;
  } catch {
    return null;
  }
}

/** Manual passcode input adapter — always available. */
export function passcodeScanner(): SessionScannerAdapter {
  return {
    kind: 'passcode',
    available: true,
    label: 'Passcode',
    start: () => {
      /* passive: pages feed values through submitPasscode() */
    },
    stop: () => {
      /* no-op */
    },
  };
}

/**
 * Camera adapter seam. Not wired to browser media capture yet — it reports
 * unavailable so the UI can fall back to passcode input without code changes
 * when hardware support arrives.
 */
export function cameraScanner(): SessionScannerAdapter {
  return {
    kind: 'camera',
    available: false,
    label: 'Kamera QR',
    start: () => {
      /* requires a camera + QR decode implementation */
    },
    stop: () => {
      /* no-op */
    },
  };
}

/** Future hardware barcode scanners (UPC/EAN) — interface reserved. */
export function barcodeScanner(): SessionScannerAdapter {
  return {
    kind: 'barcode',
    available: false,
    label: 'Shtrix-skaner',
    start: () => {
      /* requires a hardware integration contract */
    },
    stop: () => {
      /* no-op */
    },
  };
}

/** Resolve a human-facing explanation for an unavailable scanner source. */
export function scannerUnavailableReason(kind: ScannerKind): string {
  switch (kind) {
    case 'camera':
      return 'Kamera skaneri keyingi bosqichda ulanadi. Hozircha passcode rejimidan foydalaning.';
    case 'barcode':
      return 'Shtrix-skaner hali ulanishi kerak. Hozircha passcode rejimidan foydalaning.';
    default:
      return '';
  }
}