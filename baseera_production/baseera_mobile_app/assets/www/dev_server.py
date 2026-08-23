import http.server
import socketserver

PORT = 8081
Handler = http.server.SimpleHTTPRequestHandler

class NoCacheHTTPRequestHandler(Handler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
    print(f"Serving without cache at port {PORT}")
    httpd.serve_forever()
