// Copyright (c) 2024, Mezzo and contributors
// For license information, please see license.txt

frappe.ui.form.on("Custom Sales Order", {
  refresh(frm) {
    if (!frm.is_new()) {
      frm.add_custom_button(__("Apply Ratio"), () => {
        ratio_dialog = new frappe.ui.Dialog({
          title: "Set the Ratio",
          fields: [
            {
              label: "Select Variant Ratio",
              fieldname: "variant_ratio",
              fieldtype: "Link",
              options: "Default Variant Ratio",
            },
          ],
          primary_action: "apply_ratio",
          primary_action_label: "Apply",
          primary_action(values) {
            frappe.call({
              method: "frappe.client.get",
              args: {
                doctype: "Default Variant Ratio",
                name: values.variant_ratio,
              },
              callback: (r) => {
                let response = r.message;
      
                // Extract values from the response
                let { s, m, l, xl, "2xl": _2xl } = response;
      
                // Get the child table items
                let items = frm.doc.item || [];
                items.forEach((item, index) => {
                  // Setting the total quantity
                  let total_quantity = 0;
                  if (item.s > 0) {
                    item.s = s;
                    total_quantity += s;
                  } else {
                    item.s = 0;
                  }
      
                  if (item.m > 0) {
                    item.m = m;
                    total_quantity += m;
                  } else {
                    item.m = 0;
                  }
      
                  if (item.l > 0) {
                    item.l = l;
                    total_quantity += l;
                  } else {
                    item.l = 0;
                  }
      
                  if (item.xl > 0) {
                    item.xl = xl;
                    total_quantity += xl;
                  } else {
                    item.xl = 0;
                  }
      
                  if (item["2xl"] > 0) {
                    item["2xl"] = _2xl;
                    total_quantity += _2xl;
                  } else {
                    item["2xl"] = 0;
                  }
                  // Set the calculated total_quantity for the current item
                  item.quantity = total_quantity;
      
                });
      
                // Refresh the child table
                frm.refresh_field("item");
                
                // setting other field blank
                frm.set_value("parent_item", null);
                frm.save();

                // Hide the dialog
                ratio_dialog.hide();
              },
            });
          },
        });
        ratio_dialog.show();
      });
      
      frm.add_custom_button(__("Make Sales Order"), () => {
        let item_data = frm.doc.item;
        // Create an array of promises for the API calls
        let promises = item_data.map(item => {
          return new Promise((resolve, reject) => {
            frappe.call({
              method: "frappe.client.get_list",
              args: {
                doctype: "Item",
                filters: {
                  variant_of: item.item_code
                },
                fields: ["name", "stock_uom", "variant_of", "custom_mrp"]
              },
              callback: (r) => {
                if (r.message) {
                  resolve(r.message);
                } else {
                  resolve([]);
                }
              },
              error: (err) => {
                reject(err);
              }
            });
          });
        });

        // Wait for all promises to resolve
        Promise.all(promises)
          .then(results => {
            // Flatten the array of arrays into a single array of objects
            let sales_order_item_data = results.flat();
            // Create a map of item codes to quantities
            let itemQuantities = {};
            frm.doc.item.forEach(item => {
              itemQuantities[item.item_code] = {
                qty_2xl: item["2xl"] || 0,
                qty_xl: item["xl"] || 0,
                qty_l: item["l"] || 0,
                qty_m: item["m"] || 0,
                qty_s: item["s"] || 0
              };
            });

            // Generate the result array
            let result = sales_order_item_data.map(data => {
              let qty;
              if (data.name.includes("2XL")) {
                qty = itemQuantities[data.variant_of]?.qty_2xl || 0;
              } else if (data.name.includes("XL")) {
                qty = itemQuantities[data.variant_of]?.qty_xl || 0;
              } else if (data.name.includes("L")) {
                qty = itemQuantities[data.variant_of]?.qty_l || 0;
              } else if (data.name.includes("M")) {
                qty = itemQuantities[data.variant_of]?.qty_m || 0;
              } else if (data.name.includes("S")) {
                qty = itemQuantities[data.variant_of]?.qty_s || 0;
              } else {
                qty = 0;
              }

              return {
                item_code: data.name,
                delivery_date: frm.doc.delivery_date,
                qty: qty,
                rate: data.custom_mrp,
                uom: data.stock_uom
              };
            });
            frappe.call({
              method : "frappe.client.insert",
              args : {
                doc : {
                  doctype : "Sales Order",
                  naming_series : "MA/SO/.YY./",
                  customer : frm.doc.customer,
                  currency : "INR",
                  selling_price_list : "Standard Selling",
                  order_type : "Sales",
                  set_warehouse : "Work In Progress - MAPL",
                  items : result
                }
              },
              callback: (r) => {
                if (r.message) {
                  frm.set_value("sales_order_id", r.message.name)
                  frm.refresh_field("sales_order_id")
                  frm.save();
                }
              }
            })
          })
          .catch(err => {
            console.error('Error fetching item data:', err);
          });

      });
    }
  },
  onload(frm) {
    // Parent Items Filter
    frm.set_query("parent_item", () => ({
      filters: [["Item", "has_variants", "=", "1"]],
    }));

    // Transporter Filter
    frm.set_query("transporter", () => ({
      filters: [["Supplier", "is_transporter", "=", "1"]],
    }));

    // Parent Items Filter on Child Table
    frm.fields_dict["item"].grid.get_field("item_code").get_query = () => ({
      filters: [["Item", "has_variants", "=", "1"]],
    });
  },

  parent_item(frm) {
    if (!frm.doc.parent_item || dialogInstance) return;

    dialogInstance = new frappe.ui.Dialog({
      title: "Set the Ratio",
      fields: [
        {
          label: "Parent Item",
          fieldname: "parent_item",
          fieldtype: "Data",
          read_only: true,
          default: frm.doc.parent_item,
        },
        {
          label: "Select Variant Ratio",
          fieldname: "select_variant_ratio",
          fieldtype: "Select",
        },
        {
          label: "Items",
          fieldname: "items_html",
          fieldtype: "HTML",
          options: "",
        },
      ],
      size: "large",
      primary_action_label: "Submit",
      primary_action(values) {
        const sizes = ["s", "m", "l", "xl", "2xl"];
        const itemCode = frm.doc.parent_item;
        const deliveryDate = frm.doc.delivery_date;

        const itemValues = sizes.reduce((acc, size) => {
          const element = document.getElementById(`${itemCode}_${size}`);
          acc[size] = element ? parseInt(element.value, 10) || 0 : 0;
          return acc;
        }, {});

        itemValues.quantity = sizes.reduce(
          (sum, size) => sum + itemValues[size],
          0
        );

        const itemsArray = [
          {
            item_code: itemCode,
            delivery_date: deliveryDate,
            ...itemValues,
          },
        ];

        itemsArray.forEach((item) => {
          const existingItem = frm.doc.item.find(
            (i) => i.item_code === item.item_code
          );

          if (existingItem) {
            Object.assign(existingItem, item);
          } else {
            const newItem = frm.add_child("item");
            Object.assign(newItem, item);
          }
        });

        dialogInstance.$wrapper.remove();
        dialogInstance = null;
        document
          .querySelectorAll(".modal-backdrop.fade")
          .forEach((el) => el.remove());
        document.body.style.overflow = "auto";
        frm.refresh_field("item");
      },
    });

    dialogInstance.show();

    const extractSize = (sizeString) => {
      const match = sizeString.match(/^(\S+)/);
      return match ? match[1] : null;
    };

    const getItemDetails = (itemName) =>
      new Promise((resolve, reject) => {
        frappe.call({
          method: "frappe.client.get",
          args: { doctype: "Item", name: itemName },
          callback: (r) => {
            if (r.message && r.message.attributes) {
              const attributeValue = r.message.attributes
                .filter((attr) => attr.attribute === "Size")
                .map((attr) => attr.attribute_value);
              resolve(attributeValue);
            } else {
              reject(`Failed to get details for item ${itemName}`);
            }
          },
        });
      });

    frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Item",
        filters: { variant_of: frm.doc.parent_item },
        fields: ["name"],
      },
      callback: (r) => {
        const variantDataPromises = r.message.map((item) =>
          getItemDetails(item.name)
        );

        Promise.all(variantDataPromises)
          .then((results) => {
            const variantDataSizes = new Set(results.flat().map(extractSize));
            const sizeMap = { S: "S", M: "M", L: "L", XL: "XL", "2XL": "2XL" };
            const tableHeader = Object.keys(sizeMap)
              .filter((size) => variantDataSizes.has(size))
              .map(
                (size) =>
                  `<th style="width: 10%; background-color: #f2f2f2; padding: 8px; border: 1px solid #ebebeb; text-align: center;">${size}</th>`
              )
              .join("");
            const tableBody = Object.keys(sizeMap)
              .filter((size) => variantDataSizes.has(size))
              .map(
                (
                  size
                ) => `<td style="width: 10%; padding: 5px; border: 1px solid #ebebeb; text-align: center;">
                <input type="text" name="${frm.doc.parent_item}_${size}" id="${
                  frm.doc.parent_item
                }_${size.toLowerCase()}" style="border: none; outline: none; text-align: center; width: 100%; margin: 0 !important">
              </td>`
              )
              .join("");

            const tableHTML = `
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #ebebeb; border-radius: 10px;">
                <thead><tr>${tableHeader}</tr></thead>
                <tbody><tr>${tableBody}</tr></tbody>
              </table>
            `;

            dialogInstance.fields_dict.items_html.$wrapper.html(tableHTML).css({
              borderRadius: "10px",
              overflow: "hidden",
            });
          })
          .catch((error) =>
            console.error("Error in fetching item details:", error)
          );
      },
    });

    frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Default Variant Ratio",
        fields: ["name"],
        limit_page_length: null,
      },
      callback: (r) => {
        const selectField =
          dialogInstance.fields_dict.select_variant_ratio.$input;
        selectField
          .empty()
          .append($("<option></option>").attr("value", "").text(""));

        r.message.forEach((data) => {
          selectField.append(
            $("<option></option>").attr("value", data.name).text(data.name)
          );
        });
      },
    });

    dialogInstance.fields_dict.select_variant_ratio.$input.on("change", (e) => {
      frappe.call({
        method: "frappe.client.get",
        args: { doctype: "Default Variant Ratio", name: e.target.value },
        callback: (r) => {
          ["s", "m", "l", "xl", "2xl"].forEach((size) => {
            const element = document.getElementById(
              `${frm.doc.parent_item}_${size}`
            );
            if (element) {
              element.value = r.message[size] || "";
            }
          });
        },
      });
    });
  },
});

frappe.ui.form.on("Custom Sales Order Item", {
  item_add: function (frm, cdt, cdn) {
    const child = locals[cdt][cdn];
    Object.assign(child, { delivery_date: frm.doc.delivery_date });
    frm.refresh_field("item");
  },
  s: function (frm, cdt, cdn) {
    const child = locals[cdt][cdn];
    child.quantity += parseInt(child.s);
    frm.refresh_field("item");
  },
  m: function (frm, cdt, cdn) {
    const child = locals[cdt][cdn];
    child.quantity += parseInt(child.m);
    frm.refresh_field("item");
  },
  l: function (frm, cdt, cdn) {
    const child = locals[cdt][cdn];
    child.quantity += parseInt(child.l);
    frm.refresh_field("item");
  },
  xl: function (frm, cdt, cdn) {
    const child = locals[cdt][cdn];
    child.quantity += parseInt(child.xl);
    frm.refresh_field("item");
  },
  "2xl": function (frm, cdt, cdn) {
    const child = locals[cdt][cdn];
    child.quantity += parseInt(child["2xl"]);
    frm.refresh_field("item");
  },
});

let dialogInstance;
