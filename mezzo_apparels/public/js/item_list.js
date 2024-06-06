frappe.listview_settings["Item"] = {
  onload: function (listview) {
    listview.page.add_inner_button(__("Barcode Print"), function () {
      var selected_rows = listview.get_checked_items();
      var selected_ids = selected_rows.map((row) => row.name);

      let fields = [
        {
          label: "Print Format",
          fieldname: "print_format",
          fieldtype: "Select",
          options: [
            { label: "Item Barcode Print", value: "Item Barcode Print" },
            { label: "Stock Wise Print", value: "Stock Wise Print" },
          ],
        },
        {
          label: "Page Size",
          fieldname: "page_size",
          fieldtype: "Select",
          options: [
            { label: "A0", value: "A0" },
            { label: "A1", value: "A1" },
            { label: "A2", value: "A2" },
            { label: "A3", value: "A3" },
            { label: "A4", value: "A4" },
            { label: "A5", value: "A5" },
            { label: "A6", value: "A6" },
            { label: "A7", value: "A7" },
            { label: "A8", value: "A8" },
            { label: "A9", value: "A9" },
            { label: "B0", value: "B0" },
            { label: "B1", value: "B1" },
            { label: "B2", value: "B2" },
            { label: "B3", value: "B3" },
            { label: "B4", value: "B4" },
            { label: "B5", value: "B5" },
            { label: "B6", value: "B6" },
            { label: "B7", value: "B7" },
            { label: "B8", value: "B8" },
            { label: "B9", value: "B9" },
            { label: "B10", value: "B10" },
            { label: "C5E", value: "C5E" },
            { label: "Comm10E", value: "Comm10E" },
            { label: "DLE", value: "DLE" },
            { label: "Executive", value: "Executive" },
            { label: "Folio", value: "Folio" },
            { label: "Ledger", value: "Ledger" },
            { label: "Legal", value: "Legal" },
            { label: "Letter", value: "Letter" },
            { label: "Tabloid", value: "Tabloid" },
            { label: "Custom", value: "Custom" },
          ],
        },
        {
          label: "Type",
          fieldname: "type",
          fieldtype: "Select",
          options: [
            { label: "FG Barcode", value: "FG Barcode" },
            { label: "Material Barcode", value: "Material Barcode" },
          ],
          depends_on: "eval:doc.page_size === 'Custom'",
          onchange: function () {
            let select_val = document.querySelector(
              "select[data-fieldname='type']"
            ).value;
            let page_height_val = document.querySelector(
              "input[data-fieldname='page_height']"
            );
            let page_width_val = document.querySelector(
              "input[data-fieldname='page_width']"
            );
            frappe.call({
              method: "frappe.client.get_list",
              args: {
                doctype: "PDF Page Size",
                filters: {
                  name: select_val,
                },
                fields: ["*"],
              },
              callback: function (response) {
                page_height_val.value = response.message.map(
                  (data) => data.page_height_in_mm
                );
                page_width_val.value = response.message.map(
                  (data) => data.page_width__in_mm
                );
              },
            });
          },
        },
        {
          label: "Page Height (in mm)",
          fieldname: "page_height",
          fieldtype: "Int",
          default: 0,
          depends_on: "eval:doc.page_size === 'Custom'",
        },
        {
          label: "Page Width (in mm)",
          fieldname: "page_width",
          fieldtype: "Int",
          default: 0,
          depends_on: "eval:doc.page_size === 'Custom'",
        },
      ];

      selected_ids.forEach((id) => {
        fields.push({
          label: `Number of copies for ${id}`,
          fieldname: `copies_${id}`,
          fieldtype: "Int",
          default: 1,
          depends_on: "eval:doc.print_format === 'Item Barcode Print'",
        });
      });

      let d = new frappe.ui.Dialog({
        title: "Enter details",
        fields: fields,
        primary_action_label: "Submit",
        primary_action(values) {
          // console.log(values);
          let copies = [];
          let expanded_ids = [];
          selected_ids.forEach((id) => {
            copies[id] = values[`copies_${id}`];
            for (let i = 0; i < copies[id]; i++) {
              expanded_ids.push(id);
            }
          });

          let updatePromises = selected_ids.map((id) => {
            return new Promise((resolve, reject) => {
              frappe.call({
                method: "frappe.client.set_value",
                args: {
                  doctype: "Item",
                  name: id,
                  fieldname: {
                    custom_copy_numbers: values[`copies_${id}`],
                    custom_format_type: values.type,
                  },
                },
                callback: function (response) {
                  if (response.message) {
                    console.log(
                      `Updated custom_copy_numbers and custom_format_type for ${id}`
                    );
                    resolve();
                  } else {
                    console.log(
                      `Error updating custom_copy_numbers and custom_format_type for ${id}`
                    );
                    reject();
                  }
                },
              });
            });
          });

          Promise.all(updatePromises)
            .then(() => {
              setTimeout(() => {
                if (values.type === "Material Barcode") {
                  fetchBarcodePrint(expanded_ids, values);
                } else {
                  fetchBarcodePrint(selected_ids, values);
                }
                d.hide();
              }, 5000);
            })
            .catch((error) => {
              console.error("Error in updating some fields: ", error);
            });
        },
      });
      d.show();
    });
  },
};

function fetchBarcodePrint(expandedIds, values) {
  let url = `${
    window.location.origin
  }/api/method/frappe.utils.print_format.download_multi_pdf?doctype=Item&name=${JSON.stringify(
    expandedIds
  )}&format=${values.print_format}`;

  if (values.letter_head) {
    url += `&letterhead=${values.letter_head}`;
  } else {
    url += "&no_letterhead=1";
  }

  if (values.page_size === "Custom") {
    url += `&options={"page-height":${values.page_height},"page-width":${values.page_width}}`;
  } else {
    url += `&format=${values.print_format}&options={"page-size":"${values.page_size}"}`;
  }

  window.location.href = url;
}
