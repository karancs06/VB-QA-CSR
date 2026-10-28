import { useEffect, useState } from "react";
import { useLivePreviewCtx } from "../../../context/live-preview-context-provider";
import { cslp } from "../../../utils/cslp";
import { useParams } from "react-router-dom";
import { addEditableTags } from "@contentstack/utils";
import Stack from "../../../sdk/entry";

type Entry = {
  $: any;
  uid: string;
  title: string;
  content: string;
  nl_note: string;
};

export const TestingLocales = ({ ctUid }: { ctUid: string }) => {
  const lpTs = useLivePreviewCtx();
  const [entries, setEntries] = useState([] as Entry[]);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  async function fetchData() {
    const result = await getEntriesForTestingLocales(
      ctUid,
      params.locale ?? "en-us",
    );
    console.log("res", result);
    if (!result) return;
    setEntries(result);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [lpTs]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {loading ? (
        <div data-testid="testing-locales-loading">Loading...</div>
      ) : (
        entries.map((entry) => (
          <div key={entry.title}>
            <h6
              data-testid={`testing-locales-content-${entry.uid}`}
              {...cslp(entry.$.content)}
            >
              {entry.content}
            </h6>
            {/* non-localizable field — editable only on the master locale */}
            <p
              data-testid={`testing-locales-nl-note-${entry.uid}`}
              {...cslp(entry.$.nl_note)}
            >
              {entry.nl_note}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export const getEntriesForTestingLocales = async (
  ctUid: string,
  locale: string,
) => {
  const response = (await Stack.getEntryByUrl({
    contentTypeUid: ctUid,
    entryUrl: `/e2e/${ctUid}`,
    referenceFieldPath: [],
    jsonRtePath: undefined,
    locale,
  })) as any;
  const allEntries: any[] = [];
  response.forEach((item: any) => {
    allEntries.push(addTags(item, locale, ctUid));
  });

  return allEntries;
};

function addTags(entry: any, locale: string, ctUid: string) {
  addEditableTags(entry, ctUid, true, entry?.locale || locale);
  return entry;
}
