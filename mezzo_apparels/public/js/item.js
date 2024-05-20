frappe.ui.form.on("Item", {
  onload: function (frm) {
    // Check if the item is new
    if (!frm.doc.custom_barcode) {
      // Fetch the current custom_barcode_counter value
      frappe.call({
        method: "frappe.client.get_value",
        args: {
          doctype: "Stock Settings",
          fieldname: "custom_barcode_counter",
        },
        callback: function (response) {
          if (response.message) {
            var counter_value = response.message.custom_barcode_counter;
            // Set the custom_barcode field with the counter value
            frm.set_value("custom_barcode", counter_value);
          }
        },
      });
    }
  },
  validate: function (frm) {
    // Increment the custom_barcode_counter field in Stock Settings
    frappe.call({
      method: "mezzo_apparels.utils.barcode_counter_update.increment_custom_barcode_counter",
      callback: function (response) {
        if (response.message) {
          // Log success or handle the response accordingly
          console.log("Custom Barcode Counter Incremented Successfully");
        }
      },
    });
  },
  custom_barcode: function (frm, cdt, cdn) {
    frappe.call({
      method: "mezzo_apparels.utils.barcode_datasrc.generate_barcode",
      args: {
        barcode_value: frm.doc.custom_barcode,
      },
      callback: function (r) {
        var barcode_table_length = frm.doc.barcodes.length;
        if (barcode_table_length === 0) {
          var a = frm.add_child("barcodes");
          a.barcode = frm.doc.custom_barcode;
          a.custom_barcode_image = r.message;
          frm.refresh_field("barcodes");
        } else {
          $.each(frm.doc.barcodes || [], function (i, d) {
            d.barcode = frm.doc.custom_barcode;
            d.custom_barcode_image = r.message;
          });
          frm.refresh_field("barcodes");
        }
      },
    });
  },
  custom_mrp: function (frm) {
    frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Item Price",
        filters: {
          item_code: frm.doc.item_code,
          price_list: "Standard MRP",
        },
        fields: ["*"],
      },
      callback: (r) => {
        if (r.message.length === 0) {
          // If no records found, insert a new record
          frappe.call({
            method: "frappe.client.insert",
            args: {
              doc: {
                doctype: "Item Price",
                item_code: frm.doc.item_code,
                price_list_rate: frm.doc.custom_mrp,
                price_list: "Standard MRP",
              },
            },
            callback: function (response) {
              if (response) {
                frappe.msgprint(
                  "MRP has been successfully inserted in Item Price List!"
                );
              }
            },
          });
        } else {
          // If record found, update existing record
          frappe.call({
            method: "frappe.client.get",
            args: {
              doctype: "Item Price",
              filters: {
                item_code: frm.doc.item_code,
                price_list: "Standard MRP",
              },
            },
            callback: function (doc_response) {
              var itemPrice = doc_response.message;
              itemPrice.price_list_rate = frm.doc.custom_mrp;

              frappe.call({
                method: "frappe.client.save",
                args: {
                  doc: itemPrice,
                },
                callback: function (saveResponse) {
                  if (saveResponse) {
                    frappe.msgprint("MRP has been successfully updated!");
                  }
                },
              });
            },
          });
        }
      },
    });
  },
  custom_wsp: function (frm) {
    frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Item Price",
        filters: {
          item_code: frm.doc.item_code,
          price_list: "Standard WSP",
        },
        fields: ["*"],
      },
      callback: (r) => {
        if (r.message.length === 0) {
          // If no records found, insert a new record
          frappe.call({
            method: "frappe.client.insert",
            args: {
              doc: {
                doctype: "Item Price",
                item_code: frm.doc.item_code,
                price_list_rate: frm.doc.custom_wsp,
                price_list: "Standard WSP",
              },
            },
            callback: function (response) {
              if (response) {
                frappe.msgprint(
                  "WSP has been successfully inserted in Item Price List!"
                );
              }
            },
          });
        } else {
          // If record found, update existing record
          frappe.call({
            method: "frappe.client.get",
            args: {
              doctype: "Item Price",
              filters: {
                item_code: frm.doc.item_code,
                price_list: "Standard WSP",
              },
            },
            callback: function (doc_response) {
              var itemPrice = doc_response.message;
              itemPrice.price_list_rate = frm.doc.custom_wsp;

              frappe.call({
                method: "frappe.client.save",
                args: {
                  doc: itemPrice,
                },
                callback: function (saveResponse) {
                  if (saveResponse) {
                    frappe.msgprint("WSP has been successfully updated!");
                  }
                },
              });
            },
          });
        }
      },
    });
  },
});
