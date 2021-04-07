import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { EnclosureWithTitle, Share } from '../types/index.js';
import { Theme } from '../types/enums.js';
// eslint-disable-next-line import/extensions
import { IItem } from '#entities';

const themeFolders = {
  default: path.resolve(`./static/mail-templates/digest-default`),
};

const compileHbsPart = (pathStr: string, part: string) =>
  Handlebars.compile(fs.readFileSync(`${pathStr}/${part}.part.mjml`, 'utf-8'));

type HTMLMailThemeTmp = {
  header: HandlebarsTemplateDelegate<{ title: string; digestName: string }>;
  contentTable: HandlebarsTemplateDelegate<{ items: IItem[] }>;
  item: HandlebarsTemplateDelegate<{
    id: string | number;
    title?: string;
    link?: string;
    imageUrl: string;
    date: string;
    enclosures: EnclosureWithTitle[];
    content?: string;
    share: Share[];
  }>;
  footer: HandlebarsTemplateDelegate<{ unsubscribeUrl: string }>;
};

export type HTMLMailTheme = Exclude<Theme, Theme.text>;

const themes: Record<HTMLMailTheme, HTMLMailThemeTmp> = {
  default: {
    header: compileHbsPart(themeFolders.default, 'header'),
    contentTable: compileHbsPart(themeFolders.default, 'content_table'),
    item: compileHbsPart(themeFolders.default, 'item'),
    footer: compileHbsPart(themeFolders.default, 'footer'),
  },
};

export default themes;
