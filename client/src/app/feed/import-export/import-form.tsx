import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';

import Spinner from '@/components/spinner';
import { FeedImport, ImportState, ImportStatusObject } from '@/gql/generated';
import { useDropArea } from '@/hooks/use-droparea';
import { getGQLClient } from '@/lib/gqlClient.client';
import { getFeedsFromOpml, getFeedsFromText } from '@/utils/import-utils';

async function getFeeds(file?: File) {
  if (!file) return [];
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
    } catch (e) {
      console.error('Parsing error', e);
    }
  }
  const num = total ? total - errors.length : 0;
  return { message: `${num} out of ${total} feeds were imported.`, errors };
}

export function ImportForm() {
  const [isImporting, setIsImporting] = useState(false);
  const [impResult, setImpResult] = useState<ImportResults>({ message: null });
  const [errorMessage, setErrorMessage] = useState('');
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (feedImport: FeedImport | FeedImport[]) => {
      return getGQLClient().importFeeds({ feedImport });
    },
    onError: (err) => setErrorMessage((err as Error).message),
    onSuccess: (res) => {
      if (res.importFeeds.errors) {
        setErrorMessage(res.importFeeds.errors[0].message);
        return;
      }
    },
  });

  const { data: status, isPending: isLoadingStatus } = useQuery({
    queryKey: ['importStatus'],
    queryFn: async () => {
      console.log('check status', new Date().toLocaleTimeString());
      return getGQLClient().importStatus();
    },
    refetchInterval: isImporting ? 2000 : false,
  });

  const importState = status?.importStatus?.state;

  if (!isPending && !isLoadingStatus && importState === ImportState.Done) {
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
      if (!feedImport.length) return;
      try {
        setIsImporting(true);
        setImpResult({ message: null, errors: [] });
        await mutateAsync(feedImport);
      } catch {
        setIsImporting(false);
      }
    },
    [mutateAsync],
  );

  const { dropAreaRef, isHovered } = useDropArea({ onFilesDrop, disable: isImporting });

  let progressMessage = '';

  if (isImporting && status?.importStatus) {
    const { total, progress } = status.importStatus;
    progressMessage = total ? `${progress || 0}/${total}` : '';
  }

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
            <div className="text-center flex flex-col items-center">
              <p>Importing feeds</p>
              <p>{progressMessage}</p>
              <Spinner />
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
          <ul className="text-sm pl-4 list-disc overflow-hidden break-words break-all">
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
}
