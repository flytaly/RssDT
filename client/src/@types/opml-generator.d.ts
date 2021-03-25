type Header = {
  title?: string;
  dateCreated?: date;
  ownerName?: string;
};
type Outline = {
  text?: string;
  title?: string;
  type?: 'rss' | 'atom';
  xmlUrl?: string;
  htmlUrl?: string;
  digest_schedule?: string;
};

declare module 'opml-generator' {
  declare function opml(header: Header, Ooutlines: Outline[]): string;
  export default opml;
}
