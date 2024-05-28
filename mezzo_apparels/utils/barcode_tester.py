import base64
import frappe
from PIL import Image
from io import BytesIO
import barcode
from barcode.writer import ImageWriter

def generate_barcode(custom_barcodes, barcode_type='code128'):
    data_uri_image = []
    if barcode_type not in barcode.PROVIDED_BARCODES:
        # frappe.msgprint(f"Invalid barcode type: {barcode_type}")
        return None
    
    # Generate the barcode image using python-barcode library
    barcode_class = barcode.get_barcode_class(barcode_type)
    barcode_instance = barcode_class(str(custom_barcodes), writer=ImageWriter())
    
    # Create BytesIO object to hold the image data
    buffer = BytesIO()
    barcode_instance.write(buffer)
    
    # Reset buffer position to start
    buffer.seek(0)
    
    # Open the image using Pillow (PIL)
    pil_image = Image.open(buffer)
    
    # Convert the image to PNG format and encode as base64
    buffered = BytesIO()
    pil_image.save(buffered, format="PNG")
    encoded_image = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    # Add data URI prefix to the base64-encoded image
    data_uri_image = f"data:image/png;base64,{encoded_image}"
    return data_uri_image
 

# Example usage with multiple custom barcodes:
custom_barcodes = ['200000428', '200000429', '200000430']
data_uri_image = generate_barcode(custom_barcodes, barcode_type='code128')