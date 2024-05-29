import frappe

@frappe.whitelist()
def increment_custom_barcode_counter():
    stock_settings = frappe.get_single("Stock Settings")
    stock_settings.custom_barcode_counter = int(stock_settings.custom_barcode_counter) + 1
    stock_settings.save(ignore_permissions=True)
    return "Success"

