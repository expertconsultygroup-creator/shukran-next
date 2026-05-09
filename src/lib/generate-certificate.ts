import React from "react";

export async function downloadCertificate(params: {
  name: string;
  displayId: string;
  locale: "ar" | "en";
}) {
  const { pdf } = await import("@react-pdf/renderer");
  const { CertificateTemplate } = await import(
    "@/components/certificate/CertificateTemplate"
  );

  const date = new Date().toLocaleDateString(
    params.locale === "ar" ? "ar-AE" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const doc = React.createElement(CertificateTemplate, {
    name: params.name,
    displayId: params.displayId,
    date,
    locale: params.locale,
  });

  // @ts-expect-error -- react-pdf's pdf() accepts our Document-wrapping component
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shukran-certificate-${params.displayId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
