import fs from "fs";
import path from "path";
import csv from "csv-parser";

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: "Kod girilmedi." });
  }

  const filePath = path.join(process.cwd(), "data.csv");
  const records = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => records.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  const normalize = (s) =>
    (s || "").toString().trim().replace(/[\s\-_\.]/g, "").toUpperCase();

  const query = normalize(q);

  const found = records.find(
    (r) => normalize(r.company_code) === query || normalize(r.our_code) === query
  );

  if (!found) {
    return res.status(404).json({ message: "Ürün bulunamadı." });
  }

  if (normalize(found.company_code) === query) {
    return res.json({
      input_company: found.company_name,
      input_code: found.company_code,
      output_company: found.our_company_name,
      output_code: found.our_code,
    });
  } else {
    return res.json({
      input_company: found.our_company_name,
      input_code: found.our_code,
      output_company: found.company_name,
      output_code: found.company_code,
    });
  }
}
