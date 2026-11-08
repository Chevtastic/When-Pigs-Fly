"""Local dev server that tells the browser never to cache, so edited files always show up on reload.

Run from the project root:  python tools/serve.py [port]   (default 8123)
"""
import http.server, sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
http.server.ThreadingHTTPServer(('', port), NoCache).serve_forever()
