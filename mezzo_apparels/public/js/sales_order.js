frappe.ui.form.on("Sales Order", {
  onload: function (frm) {
    frm.set_query("custom_parent_item", function () {
      return {
        filters: [["Item", "has_variants", "=", "1"]],
      };
    });
    frm.set_query("custom_transporter", function () {
      return {
        filters: [["Supplier", "is_transporter", "=", "1"]],
      };
    });
  },

  custom_parent_item: function (frm) {
    if (frm.doc.custom_parent_item) {
      // Check if custom_parent_item has a value
      if (!dialogInstance) {
        // If dialog doesn't exist, create a new one
        dialogInstance = new frappe.ui.Dialog({
          title: "Select Variants",
          fields: [
            {
              label: "Parent Item",
              fieldname: "parent_item",
              fieldtype: "Data",
              read_only: true,
              default: frm.doc.custom_parent_item,
            },
            {
              label: "Items",
              fieldname: "items_html",
              fieldtype: "HTML",
              options: "", // Empty initially
            },
          ],
          size: "small",
          primary_action_label: "Submit",
          primary_action(values) {
            let selectedItems = [];
            let checkboxes = document.querySelectorAll(
              'input[type="checkbox"][name$="_checkbox"]'
            );
            checkboxes.forEach((checkbox) => {
              if (checkbox.name !== "select_all_checkbox" && checkbox.checked) {
                let itemCode = checkbox.name.replace("_checkbox", "");
                let quantity = parseInt(
                  document.querySelector(`input[name="${itemCode}_quantity"]`)
                    .value
                );
                selectedItems.push({
                  item_code: itemCode,
                  qty: quantity,
                });
              }
            });

            // Append selected items to cur_frm.selected_doc.items
            selectedItems.forEach((item) => {
              // Check if the item already exists in the "items" child table
              var existing_item = frm.doc.items.find(
                (i) => i.item_code === item.item_code
              );
              if (existing_item) {
                // If the item exists, update the quantity
                existing_item.qty += item.qty;
              } else {
                // If the item doesn't exist, add a new row
                var i = frm.add_child("items");
                i.item_code = item.item_code;
                i.qty = item.qty;
              }
            });

            // Remove the dialog from the DOM
            dialogInstance.$wrapper.remove();
            dialogInstance = null; // Reset the dialog instance
            // Remove modal-backdrop fade divs from the DOM
            document.querySelectorAll(".modal-backdrop.fade").forEach((el) => {
              el.remove();
            });

            frm.refresh_field("items");
          },
        });
      } else {
        // If dialog already exists, update the parent item field
        dialogInstance.fields_dict.parent_item.set_input(
          frm.doc.custom_parent_item
        );
      }

      // Show dialog
      dialogInstance.show();

      // Make frappe call to get items and populate the HTML field
      frappe.call({
        method: "frappe.client.get_list",
        args: {
          doctype: "Item",
          filters: {
            variant_of: frm.doc.custom_parent_item,
          },
          fields: ["item_code"],
        },
        callback: (r) => {
          let response = r.message;

          // Create table rows with checkboxes, item codes, and quantity input fields
          let tableRows = response
            .map(
              (item) => `
                          <tr>
                              <td style="padding: 5px; border: 1px solid #ebebeb"><center><input type="checkbox" name="${item.item_code}_checkbox" style="margin : 0 !important"></center></td>
                              <td style="padding: 5px; border: 1px solid #ebebeb">${item.item_code}</td>
                              <td style="padding: 5px; border: 1px solid #ebebeb"><input type="number" name="${item.item_code}_quantity" value="1" style="border : 0; box-shadow : 0;"></td>
                          </tr>
                          `
            )
            .join("");

          // HTML for the table
          let tableHTML = `
                          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ebebeb; border-radius: 5px;">
                              <thead>
                                  <tr>
                                      <th style="background-color: #f2f2f2; padding: 8px;border: 1px solid #ebebeb"><center><input type="checkbox" name="select_all_checkbox" id="select_all_checkbox" style="margin : 0 !important"></center></th>
                                      <th style="background-color: #f2f2f2; padding: 8px;border: 1px solid #ebebeb">Item Code</th>
                                      <th style="background-color: #f2f2f2; padding: 8px;">Quantity</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  ${tableRows}
                              </tbody>
                          </table>
                          `;

          // Update dialog with HTML field for the table
          dialogInstance.fields_dict.items_html.$wrapper.html(tableHTML);

          // Select All checkbox functionality
          setTimeout(() => {
            let selectAllCheckbox = document.getElementById(
              "select_all_checkbox"
            );
            selectAllCheckbox.addEventListener("change", function () {
              let checkboxes = document.querySelectorAll(
                'input[type="checkbox"][name$="_checkbox"]'
              );
              checkboxes.forEach((checkbox) => {
                checkbox.checked = selectAllCheckbox.checked;
              });
            });
          }, 150);
        },
      });
    }
  },
  custom_barcode_scan: function (frm) {
    if (frm.doc.custom_barcode_scan) {
      // Check if custom_parent_item has a value
      if (!dialogInstance2) {
        // If dialog doesn't exist, create a new one
        dialogInstance2 = new frappe.ui.Dialog({
          title: "Select Variants",
          fields: [
            {
              label: "Variants",
              fieldname: "variants",
              fieldtype: "Data",
              read_only: true,
              default: frm.doc.custom_barcode_scan,
            },
            {
              label: "Items",
              fieldname: "items_html",
              fieldtype: "HTML",
              options: "", // Empty initially
            },
          ],
          size: "small",
          primary_action_label: "Submit",
          primary_action(values) {
            let selectedItems = [];
            let checkboxes = document.querySelectorAll(
              'input[type="checkbox"][name$="_checkbox"]'
            );
            checkboxes.forEach((checkbox) => {
              if (checkbox.name !== "select_all_checkbox" && checkbox.checked) {
                let itemCode = checkbox.name.replace("_checkbox", "");
                let quantity = parseInt(
                  document.querySelector(`input[name="${itemCode}_quantity"]`)
                    .value
                );
                selectedItems.push({
                  item_code: itemCode,
                  qty: quantity,
                });
              }
            });

            // Append selected items to cur_frm.selected_doc.items
            selectedItems.forEach((item) => {
              // Check if the item already exists in the "items" child table
              var existing_item = frm.doc.items.find(
                (i) => i.item_code === item.item_code
              );
              if (existing_item) {
                // If the item exists, update the quantity
                existing_item.qty += item.qty;
              } else {
                // If the item doesn't exist, add a new row
                var i = frm.add_child("items");
                i.item_code = item.item_code;
                i.qty = item.qty;
              }
            });

            // Remove the dialog from the DOM
            dialogInstance2.$wrapper.remove();
            dialogInstance2 = null; // Reset the dialog instance

            // Remove modal-backdrop fade divs from the DOM
            document.querySelectorAll(".modal-backdrop.fade").forEach((el) => {
              el.remove();
            });

            frm.refresh_field("items");
          },
        });
      } else {
        // If dialog already exists, update the parent item field
        dialogInstance2.fields_dict.variants.set_input(
          frm.doc.custom_barcode_scan
        );
      }

      // Show dialog
      dialogInstance2.show();

      // Make frappe call to get items and populate the HTML field
      frappe.call({
        method: "frappe.client.get_list",
        args: {
          doctype: "Item",
          filters: {
            custom_barcode: frm.doc.custom_barcode_scan,
          },
          fields: ["variant_of"],
        },
        callback: (r) => {
          let response = r.message;
          response.map((data) => {
            frappe.call({
              method: "frappe.client.get_list",
              args: {
                doctype: "Item",
                filters: {
                  variant_of: data.variant_of,
                },
                fields: ["item_code"],
              },
              callback: (r) => {
                let vr_resp = r.message;
                // Create table rows with checkboxes, item codes, and quantity input fields
                let tableRows = vr_resp
                  .map(
                    (item) => `
                              <tr>
                                  <td style="padding: 5px; border: 1px solid #ebebeb"><center><input type="checkbox" name="${item.item_code}_checkbox" style="margin : 0 !important"></center></td>
                                  <td style="padding: 5px; border: 1px solid #ebebeb">${item.item_code}</td>
                                  <td style="padding: 5px; border: 1px solid #ebebeb"><input type="number" name="${item.item_code}_quantity" value="1" style="border : 0; box-shadow : 0;"></td>
                              </tr>
                              `
                  )
                  .join("");

                // HTML for the table
                let tableHTML = `
                              <table style="width: 100%; border-collapse: collapse; border: 1px solid #ebebeb; border-radius: 5px;">
                                  <thead>
                                      <tr>
                                          <th style="background-color: #f2f2f2; padding: 8px;border: 1px solid #ebebeb"><center><input type="checkbox" name="select_all_checkbox" id="select_all_checkbox" style="margin : 0 !important"></center></th>
                                          <th style="background-color: #f2f2f2; padding: 8px;border: 1px solid #ebebeb">Item Code</th>
                                          <th style="background-color: #f2f2f2; padding: 8px;">Quantity</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      ${tableRows}
                                  </tbody>
                              </table>
                              `;

                // Update dialog with HTML field for the table
                dialogInstance2.fields_dict.items_html.$wrapper.html(tableHTML);

                // Select All checkbox functionality
                setTimeout(() => {
                  let selectAllCheckbox = document.getElementById(
                    "select_all_checkbox"
                  );
                  selectAllCheckbox.addEventListener("change", function () {
                    let checkboxes = document.querySelectorAll(
                      'input[type="checkbox"][name$="_checkbox"]'
                    );
                    checkboxes.forEach((checkbox) => {
                      checkbox.checked = selectAllCheckbox.checked;
                    });
                  });
                }, 150);
              },
            });
          });
        },
      });
    }
  },
});

let dialogInstance; // Define dialog instance outside the function
let dialogInstance2; // Define dialog instance2 outside the function
