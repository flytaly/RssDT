import React, { useCallback, useState } from 'react';
import {
  ImportState,
  ImportStatusObject,
  useImportFeedsMutation,
  useImportStatusQuery,
} from '../generated/graphql';
import { useDropArea } from '../hooks/use-droparea';
import { getFeedsFromOpml, getFeedsFromText } from '../utils/import-utils';

async function getFeeds(file: File) {
  if (file.name.endsWith('.opml') || file.type === 'text/xml') {
    const content = await file.text();
    const feeds = await getFeedsFromOpml(content);
    return feeds;
  }
  if (file.type === 'text/plain') {
    const content = await file.text();
    const feeds = getFeedsFromText(content);
    return feeds;
  }
  return [];
}

type ImportResultsError = { error: string; url: string };

type ImportResults = {
  message?: string | null;
  errors?: ImportResultsError[];
};

function getResultMessages(status: ImportStatusObject): ImportResults {
  const { total, result } = status;

  const errors: ImportResultsError[] = [];
  if (result) {
    try {
      const parsed = JSON.parse(result) as ImportResultsError[];
      if (parsed.length) {
        errors.push(...parsed);
      }
    } catch {
      //
    }
  }
  const num = total ? total - errors.length : 0;
  return { message: `${num} out of ${total} feeds were imported.`, errors };
}

export const ImportForm = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [impResult, setImpResult] = useState<ImportResults>({ message: null });
  const [importFeeds, { error, data, loading: l1 }] = useImportFeedsMutation();
  const errorMessage = error?.message || data?.importFeeds.errors?.[0].message;

  const { data: status, stopPolling, loading: l2 } = useImportStatusQuery({
    ssr: false,
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    pollInterval: isImporting ? 2000 : 0,
  });

  const importState = status?.importStatus?.state;

  if (!l1 && !l2 && importState === ImportState.Done) {
    stopPolling();
    if (isImporting) setIsImporting(false);
    if (!isImporting && !impResult.message) {
      setImpResult(getResultMessages(status!.importStatus!));
    }
  }
  if (!isImporting && importState === ImportState.Importing) {
    setIsImporting(true);
  }

  const onFilesDrop = useCallback(
    async (fl?: FileList | null) => {
      if (!fl) return;
      const feedImport = await getFeeds(fl[0]);
      try {
        setIsImporting(true);
        setImpResult({ message: null, errors: [] });
        await importFeeds({ variables: { feedImport } });
      } catch {
        setIsImporting(false);
      }
    },
    [importFeeds],
  );

  const { dropAreaRef, isHovered } = useDropArea({ onFilesDrop, disable: isImporting });

  return (
    <div className="px-3 py-5 w-full">
      <form id="drop-area" ref={dropAreaRef as React.RefObject<HTMLFormElement>}>
        <label
          htmlFor="fileElem"
          className={`flex justify-center items-center w-full h-36 p-1 border-2 border-dashed text-center ${
            isHovered ? 'bg-primary-2 border-primary' : 'bg-primary-1 border-secondary'
          } ${isImporting ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {isImporting ? (
            <div className="text-center">
              <p>Importing feeds</p>
              <p>{`${status?.importStatus?.progress}/${status?.importStatus?.total}`}</p>
            </div>
          ) : (
            <div>
              <p>Drop file here or click to upload</p>
              <p>(OPML or text)</p>
            </div>
          )}
        </label>

        <input
          className="hidden"
          type="file"
          id="fileElem"
          accept="text/plain,text/opml,text/xml"
          onChange={(e) => {
            onFilesDrop(e.target.files);
          }}
          disabled={isImporting}
        />
      </form>
      {errorMessage && <div className="mt-2 text-error">{errorMessage}</div>}

      {impResult.message && <div>{impResult.message}</div>}

      {impResult.errors?.length ? (
        <>
          <div>Errors:</div>
          <ul className="text-sm pl-4 list-disc">
            {impResult.errors?.map((err) => (
              <li key={err.url}>
                <p>{err.url}</p>
                <p className="ml-2 text-error">{err.error}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
};
