import frappe
from frappe.model.document import Document

class myItem(Document):
    def after_insert(self):
        self.update_item_price("Standard MRP", self.custom_mrp)
        self.update_item_price("Standard WSP", self.custom_wsp)
        
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
                
            # Barcode Entry Logic
            if barcode_entry:
                barcode_entry.barcode = self.custom_barcode
            else:
                self.append('barcodes', {
                    'barcode': self.custom_barcode,
                    'uom': ''  # Assuming you may want to keep 'UOM' field empty or set it as needed
                })

            self.save(ignore_permissions=True)
            frappe.db.commit()
                
    def on_update(self):
        self.update_item_price("Standard MRP", self.custom_mrp)
        self.update_item_price("Standard WSP", self.custom_wsp)

    def update_item_price(self, price_list, price_rate):
        # Check if the item does not have variants
        item = frappe.get_doc("Item", self.item_code)
        
        if item.has_variants:
            frappe.msgprint(f"Item {self.item_code} has variants and will be skipped.")
            return

        existing_item_prices = frappe.get_list("Item Price", 
                                            filters={
                                                "item_code": self.item_code,
                                                "price_list": price_list
                                            }, 
                                            fields=["name", "price_list_rate"])
        # My Custom-Logic
        if not existing_item_prices:
            # If no records found, insert a new record
            new_item_price = frappe.get_doc({
                "doctype": "Item Price",
                "item_code": self.item_code,
                "price_list_rate": price_rate,
                "price_list": price_list
            })
            new_item_price.insert()
            frappe.msgprint(f"{price_list} has been successfully inserted in Item Price List!")
        else:
            # If record found, update existing record
            item_price_doc = frappe.get_doc("Item Price", existing_item_prices[0].name)
            item_price_doc.price_list_rate = price_rate
            item_price_doc.save()
            frappe.msgprint(f"{price_list} has been successfully updated in Item Price List!")
