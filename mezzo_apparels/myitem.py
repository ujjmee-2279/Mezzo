import frappe
from frappe.model.document import Document

class myItem(Document):
    def after_insert(self):
        if not self.custom_barcode and not self.has_variants:
            stock_settings = frappe.get_single("Stock Settings")
            stock_settings.custom_barcode_counter = int(stock_settings.custom_barcode_counter) + 1
            stock_settings.save(ignore_permissions=True)
            frappe.db.commit()
            # Set custom_barcode value directly from Python
            self.custom_barcode = stock_settings.custom_barcode_counter

            # Check if there's already a row in the barcodes table with the custom barcode
            barcode_entry = None
            for barcode in self.barcodes:
                if barcode.barcode == str(self.custom_barcode):  # Adjusted to check for existing barcode
                    barcode_entry = barcode
                    break

            if barcode_entry:
                barcode_entry.barcode = self.custom_barcode
            else:
                self.append('barcodes', {
                    'barcode': self.custom_barcode,
                    'uom': ''  # Assuming you may want to keep 'UOM' field empty or set it as needed
                })

            self.save(ignore_permissions=True)
            frappe.db.commit()
        
