import tkinter as tk
from tkhtmlview import HTMLLabel
import requests

# Initialize the main window
root = tk.Tk()
root.title("Super Surf Lite")
root.geometry("800x600")

# Search bar
search_bar = tk.Entry(root, width=80)
search_bar.pack(pady=10)

# Browser view area
browser_frame = tk.Frame(root, bg="white", width=800, height=500)
browser_frame.pack(fill="both", expand=True, padx=10, pady=10)

# HTML display area
display_area = HTMLLabel(browser_frame, html="")
display_area.pack(fill="both", expand=True)

def search():
    query = search_bar.get()
    if query:
        url = f"https://searxng.net/search?q={query.replace(' ', '+')}"
        try:
            response = requests.get(url)
            if response.status_code == 200:
                display_area.set_html(response.text)
            else:
                display_area.set_html(f"<h1>Error</h1><p>Failed to retrieve results. Status code: {response.status_code}</p>")
        except Exception as e:
            display_area.set_html(f"<h1>Error</h1><p>{str(e)}</p>")

# Bind the Enter key to the search bar to trigger search
search_bar.bind("<Return>", lambda event: search())

root.mainloop()
