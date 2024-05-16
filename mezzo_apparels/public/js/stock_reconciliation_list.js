frappe.listview_settings["Stock Reconciliation"] = {
    onload: function (listview) {
      listview.page.add_inner_button(__("Barcode Print"), function () {
        var selected_rows = listview.get_checked_items();
        var selected_ids = selected_rows.map((row) => row.name);
        let d = new frappe.ui.Dialog({
          title: "Enter details",
          fields: [
            {
              label: "Letter Head",
              fieldname: "letter_head",
              fieldtype: "Link",
              options: "Letter Head",
            },
            {
              label: "Print Format",
              fieldname: "print_format",
              fieldtype: "Link",
              options: "Print Format",
              get_query: function () {
                // Define your filter query here
                return {
                  filters: {
                    doc_type: "Stock Reconciliation",
                  },
                };
              },
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
          ],
          primary_action_label: "Submit",
          primary_action(values) {
            // Handle logic to fetch selected values and call the API
            // Example:
            fetchBarcodePrint(selected_ids, values);
            d.hide();
          },
        });
        d.show();
      });
    },
  };
  
  function fetchBarcodePrint(selectedIds, values) {
    let url = `${window.location.origin}/api/method/frappe.utils.print_format.download_multi_pdf?doctype=Stock Reconciliation&name=${JSON.stringify(
      selectedIds
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
  