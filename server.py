import http.server
import socketserver

if __name__ == '__main__':

	PORT = 8000

	Handler = http.server.SimpleHTTPRequestHandler

	trying = True

	while (trying):
		try:
			httpd = socketserver.TCPServer(("", PORT), Handler)
			trying = False
		except:
			PORT += 1

	print("serving at port", PORT)
	httpd.serve_forever()