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
            reqd: 1,
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
            reqd: 1,
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
            default: "0",
            reqd: 0,
            depends_on: "eval:doc.page_size === 'Custom'",
          },
          {
            label: "Page Width (in mm)",
            fieldname: "page_width",
            fieldtype: "Int",
            reqd: 0,
            default: "0",
            depends_on: "eval:doc.page_size === 'Custom'",
          },
        ],
        primary_action_label: "Submit",
        primary_action(values) {
          // Handle logic to fetch selected values and call the API
          // Example:
          // console.log(selected_ids, values);

          // CALL THE PRINT BARCODE MULTIPLE PDF FUNCTION
          fetchBarcodePrint(selected_ids, values);
          // fetchBarcodePrint(selected_ids, values);
          d.hide();
        },
      });
      d.show();
    });
  },
};

function fetchBarcodePrint(selectedIds, values) {
  let url = `${
    window.location.origin
  }/api/method/frappe.utils.print_format.download_multi_pdf?doctype=Stock Reconciliation&name=${JSON.stringify(
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

// function PrintBarcode(selected_names, print_configs) {
//   var response_data = "";

//   frappe.call({
//     method: "mezzo_apparels.utils.stock_reconciliation.get_barcode_print",
//     args: {
//       selected_names: selected_names,
//       print_configs: print_configs,
//     },
//     freeze: true,
//     freeze_message: "Generating Print Format...",
//     callback: function (response) {
//       console.log(response.message);
//       response_data = response.message;

//       var field_list = [];
//       var html_content = `<div style="display:flex;flex-direction:column;gap:24px;">`;

//       if (response_data.data) {
//         response_data.data.forEach((data) => {
//           // field_list.push({
//           //   label: data.name,
//           //   fieldname: data.name.toLowerCase(),
//           //   fieldtype: "Button",
//           //   default: data.url,
//           //   onchange: function () {
//           //     window.open(data.url);
//           //   },
//           // });
//           html_content += `
//           <div class="">
//             <h5>${data.name}</h5>
//             <div class="d-flex" style="gap:16px;">
//               <a
//                 class="btn btn-xs btn-default px-3 py-2 w-50"
//                 target="_blank"
//                 href="${data.url}"
//               >
//                 Open PDF
//               </a>
//               <a
//                 class="btn btn-xs btn-default px-3 py-2 w-50"
//                 href="${data.url}"                
//                 download=""
//               >
//                 Download PDF
//               </a>
//             </div>
//           </div>`;
//         });

//         html_content += `</div>`;
//         let print_dialog = new frappe.ui.Dialog({
//           title: "Print Selected Documents",
//           fields: [
//             {
//               label: "Output",
//               fieldname: "output",
//               fieldtype: "HTML",
//               options: html_content,
//             },
//           ],
//         });
//         print_dialog.show();

//         // response_data.data.forEach((data) => {
//         //   window.open(data.url);
//         // });
//       }
//     },
//   });
// }
