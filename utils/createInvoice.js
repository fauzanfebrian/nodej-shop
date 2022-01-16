const PDFDocument = require("pdfkit");

module.exports = (order, destination) => {
  const pdf = new PDFDocument();
  const width = 612;

  if (destination.length > 0) destination.forEach((p) => pdf.pipe(p));
  else destination && pdf.pipe(destination);

  pdf.font("Helvetica");
  pdf
    .fontSize(32)
    .fillColor("#00695c")
    .text("NodeShop", 50, 30, { link: process.env.APP_URI })
    .fillColor("#6a6f73")
    .fontSize(12)
    .text(`# ${order._id}`, width - 500, 40, {
      width: 450,
      align: "right",
    })
    .fillColor("black");

  const yTableInvoice = 130;
  pdf
    .moveTo(50, yTableInvoice - 13)
    .lineTo(width - 50, yTableInvoice - 13)
    .dash(width - 50, { space: 0 })
    .strokeColor("#6a6f73")
    .stroke();
  pdf.fontSize(26).text("Invoice", 50, yTableInvoice);
  pdf
    .moveTo(50, yTableInvoice + 30)
    .lineTo(width - 50, yTableInvoice + 30)
    .dash(width - 50, { space: 0 })
    .strokeColor("#6a6f73")
    .stroke();

  let yTableProduct = yTableInvoice + 40;
  512 / 4;
  const widthTab = 322 / 3;
  pdf
    .fontSize(18)
    .text("Name", 50, yTableProduct, { underline: true, width: widthTab })
    .text("description", 50 + widthTab, yTableProduct, {
      underline: true,
      width: 190,
    })
    .text("quantity", 240 + widthTab, yTableProduct, {
      underline: true,
      width: widthTab,
    })
    .text("price", 240 + widthTab * 2, yTableProduct, {
      underline: true,
      width: widthTab,
    });
  let totalPrice = 0;
  order.products.forEach((p, index) => {
    totalPrice += p.quantity * p.product.price;
    yTableProduct += 30 * (index + 1);
    pdf
      .fontSize(18)
      .fillColor("#6a6f73")
      .text(p.product.title, 50, yTableProduct, { width: widthTab })
      .text(p.product.description, 50 + widthTab, yTableProduct, { width: 190 })
      .text(p.quantity, 240 + widthTab, yTableProduct, { width: widthTab })
      .text(
        `$ ${p.product.price * p.quantity}`,
        240 + widthTab * 2,
        yTableProduct,
        { width: widthTab }
      );
  });
  pdf
    .fillColor("black")
    .fontSize(20)
    .text(`Total price: $ ${totalPrice}`, 50, yTableProduct + 50, {
      width: width - 100,
      align: "right",
    });

  pdf.end();
  return pdf;
};
