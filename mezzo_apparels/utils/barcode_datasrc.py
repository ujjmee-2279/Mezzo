import base64
import frappe
import requests

@frappe.whitelist()
def generate_barcode(barcode_value):
    # Request URL for barcode generation
    url = f"https://barcode.tec-it.com/barcode.ashx?data={barcode_value}"

    # Fetch the barcode image from the URL
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code == 200:
        # Convert the image to base64
        base64_image = base64.b64encode(response.content).decode('utf-8')
        return base64_image
    else:
        frappe.msgprint("Failed to generate barcode.")
