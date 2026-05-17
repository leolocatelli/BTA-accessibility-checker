// accessibility-checker/src/components/TranscriptSeoPanel.js

export default function TranscriptSeoPanel({
  seoSummary,
  keywords = [],
  metaDescription,
}) {
  const copyText = async (text) => {
    if (!text) return;

    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <h3 className="mb-4 text-xl font-bold text-gray-800">SEO Content</h3>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              SEO Summary
            </h4>

            <button
              type="button"
              onClick={() => copyText(seoSummary)}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
            >
              Copy
            </button>
          </div>

          <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
            {seoSummary || "No SEO summary generated yet."}
          </p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
            Keywords
          </h4>

          <div className="flex flex-wrap gap-2">
            {keywords.length > 0 ? (
              keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">
                No keywords generated yet.
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Meta Description
            </h4>

            <button
              type="button"
              onClick={() => copyText(metaDescription)}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
            >
              Copy
            </button>
          </div>

          <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
            {metaDescription || "No meta description generated yet."}
          </p>
        </div>
      </div>
    </div>
  );
}