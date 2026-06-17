import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Download, FileBadge, Gem, Plus, Loader2 } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import api from "../lib/api";
import { formatAED } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import PortfolioCertificate from "../components/certificate/PortfolioCertificate";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";

export default function ValuationCertificate() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const certRef = useRef(null);

  useEffect(() => {
    api
      .get("/products", { params: { sort: "value-high" } })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const total = products.reduce((s, p) => s + (p.estimatedValue || 0), 0);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    setError("");
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;

      // Slice a tall certificate across multiple A4 pages.
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(img, "PNG", 0, position, pageW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position -= pageH;
        pdf.addPage();
        pdf.addImage(img, "PNG", 0, position, pageW, imgH);
        heightLeft -= pageH;
      }
      pdf.save(`LIALI-Valuation-Certificate-${new Date().getFullYear()}.pdf`);
    } catch (e) {
      setError("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Spinner label="Preparing your certificate…" />;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-ink sm:text-3xl">
            <FileBadge size={26} className="text-gold-500" />
            Valuation Certificate
          </h1>
          <p className="mt-1 text-sm text-muted">
            A portfolio-wide certificate of every item you own and its estimated value.
          </p>
        </div>
        {products.length > 0 && (
          <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Download size={18} /> Download PDF
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          icon={Gem}
          title="Nothing to certify yet"
          message="Add jewellery items to your portfolio, then generate your branded valuation certificate here."
          action={
            <Link to="/jewellery" className="btn btn-primary">
              <Plus size={18} /> Add Jewellery
            </Link>
          }
        />
      ) : (
        <>
          {/* Quick summary */}
          <div className="mb-5 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-2xl border border-gold-200 bg-gradient-to-r from-gold-100/60 to-cream-50 px-6 py-4">
            <div>
              <p className="text-[0.68rem] font-medium uppercase tracking-wider text-muted">
                Items
              </p>
              <p className="font-display text-xl font-semibold text-ink">
                {products.length}
              </p>
            </div>
            <div className="h-9 w-px bg-gold-200" />
            <div>
              <p className="text-[0.68rem] font-medium uppercase tracking-wider text-muted">
                Total Portfolio Value
              </p>
              <p className="font-display text-xl font-semibold text-gold-700">
                {formatAED(total)}
              </p>
            </div>
          </div>

          {/* Framed certificate preview */}
          <div className="overflow-x-auto rounded-2xl bg-cream-200/60 p-4 sm:p-8">
            <div className="mx-auto w-fit shadow-luxe-lg">
              <PortfolioCertificate ref={certRef} products={products} user={user} total={total} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
