import frappe
from frappe.model.document import Document

class myItem(Document):
    def after_insert(self):
        if self.standard_rate:
            for default in self.item_defaults or [frappe._dict()]:
                self.add_price(default.default_price_list)

        if self.opening_stock:
            self.set_opening_stock()

        if not self.custom_barcode and not self.has_variants:
            stock_settings = frappe.get_single("Stock Settings")
            stock_settings.custom_barcode_counter = int(stock_settings.custom_barcode_counter) + 1
            stock_settings.save(ignore_permissions=True)
            frappe.db.commit()
            # Set custom_barcode value directly from Python
            self.custom_barcode = stock_settings.custom_barcode_counter
        
