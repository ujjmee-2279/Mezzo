frappe.ui.form.on("Sales Order", {
    onload: function (frm) {
      frm.set_query("custom_parent_item", function () {
        return {
          filters: [["Item", "has_variants", "=", "1"]],
        };
      });
    },
    custom_parent_item: function (frm) {
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
  
          // Create the dialog with HTML field for the table
          let d = new frappe.ui.Dialog({
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
                options: tableHTML,
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
                var i = frm.add_child("items");
                i.item_code = item.item_code;
                i.qty = item.qty;
              });
              d.hide();
              frm.refresh_field("items");
            },
          });
  
          // Show dialog
          d.show();
  
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
    },
  });
  