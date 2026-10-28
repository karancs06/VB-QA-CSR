import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import DevTools from "./devtools";
import { getHeaderRes, getFooterRes, getAllEntries } from "../helper";
import { onEntryChange } from "../sdk/entry";
import {
  EntryProps,
  Entry,
  NavLink,
  Links,
  HeaderProps,
  FooterProps,
  NavmenuProps,
  HeadermenuProps,
} from "../typescript/layout";
import { cloneDeep } from "lodash";

export default function Layout({ entry }: { entry: EntryProps }) {
  const history = useNavigate();
  const { locale } = useParams();
  const [getLayout, setLayout] = useState({
    header: {} as HeaderProps,
    footer: {} as FooterProps,
    navHeaderList: {} as HeadermenuProps,
    navFooterList: {} as NavmenuProps,
  });
  const mergeObjs = (...objs: any) => Object.assign({}, ...objs);
  const jsonObj = mergeObjs(
    { header: getLayout.header },
    { footer: getLayout.footer },
    entry,
  );

  const [error, setError] = useState(false);

  async function fetchData() {
    try {
      const header = await getHeaderRes(locale);
      const footer = await getFooterRes(locale);
      const allEntry = await getAllEntries(locale);
      if (!header || !footer) return;
      const navHeaderList = cloneDeep(header.navigation_menu);
      const navFooterList = cloneDeep(footer.navigation.link);
      if (allEntry.length !== header.navigation_menu.length) {
        allEntry.forEach((entry: Entry) => {
          const hFound = header.navigation_menu.find(
            (navLink: NavLink) => navLink.label === entry.title,
          );
          if (
            !hFound &&
            entry.title &&
            !(
              entry.title.startsWith("automationPage") ||
              entry.title.startsWith("pageautomation1") ||
              entry.title.startsWith("E2E") ||
              entry.title.startsWith("test")
            )
          ) {
            navHeaderList.push({
              $: {
                label: entry.$.title,
              },
              uid: header.uid,
              label: entry.title,
              page_reference: [
                {
                  $: {
                    title: entry.$?.title,
                    url: entry.$?.url,
                  },
                  title: entry.title,
                  url: entry.url,
                },
              ],
            });
          }
          const fFound = footer.navigation.link.find(
            (link: Links) => link.title === entry.title,
          );
          if (
            !fFound &&
            entry.title &&
            !(
              entry.title.startsWith("automationPage") ||
              entry.title.startsWith("pageautomation1")
            )
          ) {
            navFooterList.push({
              $: {
                title: entry.$.title,
                href: entry.$.url,
              },
              title: entry.title,
              href: entry.url,
            });
          }
        });
      }

      setLayout({
        header: header,
        footer: footer,
        navHeaderList,
        navFooterList,
      });
    } catch (error) {
      setError(true);
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(fetchData);
  }, []);

  useEffect(() => {
    error && history("/error");
  }, [error]);

  return (
    <div className="layout" data-testid="layout">
      <Header
        header={getLayout.header}
        navMenu={getLayout.navHeaderList}
        data-testid="header"
      />
      <DevTools response={jsonObj} data-testid="devtools" />
      <Outlet data-testid="outlet" />
      <Footer
        footer={getLayout.footer}
        navMenu={getLayout.navFooterList}
        data-testid="footer"
      />
    </div>
  );
}
