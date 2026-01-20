// Buffer polyfill for browser (required by Deepgram SDK)
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import './bootstrap';
import './gennie';
