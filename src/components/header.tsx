import React from "react";
import { Link, NavLink, useMatch, useResolvedPath } from "react-router-dom";
import parse from "html-react-parser";
import Tooltip from "../components/too-tip";
import Skeleton from "react-loading-skeleton";
import { HeaderProps, HeadermenuProps, List } from "../typescript/layout";

const NavLinkHOC = (list: List) => {
  const hasURL =
    list.page_reference &&
    list.page_reference.length &&
    list.page_reference[0].url;
  const resolved = useResolvedPath(hasURL ? list.page_reference[0].url : "");
  const match = useMatch({ path: resolved.pathname, end: true });

  return (
    <NavLink
      {...list?.$?.label}
      to={hasURL ? list.page_reference[0].url : ""}
      className={hasURL && match ? "active" : ""}
      data-testid={`nav-link-${list.label}`}
    >
      {list.label}
    </NavLink>
  );
};

export default function Header({
  header,
  navMenu,
}: {
  header: HeaderProps;
  navMenu: HeadermenuProps;
}) {
  return (
    <header className="header" data-testid="header" id="header">
      {Object.keys(header).length ? (
        <div
          className="note-div"
          {...(header.notification_bar?.$?.announcement_text as any)}
          data-testid="note-div"
        >
          {header.notification_bar.show_announcement &&
            header.notification_bar.announcement_text &&
            parse(header.notification_bar.announcement_text)}
        </div>
      ) : (
        <div className="note-div" data-testid="note-div-skeleton">
          <Skeleton />
        </div>
      )}
      <div className="max-width header-div" data-testid="header-div">
        <div className="wrapper-logo" data-testid="wrapper-logo">
          {header.logo ? (
            <Link to="/" title="Contentstack" data-testid="logo-link">
              <img
                {...(header.logo?.$?.url as any)}
                className="logo"
                src={header.logo?.url}
                alt={header.logo?.filename}
                data-testid="logo-img"
              />
            </Link>
          ) : (
            <a data-testid="logo-skeleton">
              <Skeleton width={200} />
            </a>
          )}
        </div>
        <input
          className="menu-btn"
          type="checkbox"
          id="menu-btn"
          data-testid="menu-btn"
        />
        <label className="menu-icon" htmlFor="menu-btn" data-testid="menu-icon">
          <span className="navicon" data-testid="navicon" />
        </label>
        <nav className="menu" data-testid="menu">
          <ul className="nav-ul header-ul" data-testid="nav-ul">
            {navMenu.length ? (
              navMenu?.map((list, index) => (
                <li
                  key={`header-nav-menu-${index}`}
                  className="nav-li"
                  data-testid={`nav-li-${index}`}
                >
                  <NavLinkHOC {...list} />
                </li>
              ))
            ) : (
              <li data-testid="nav-li-skeleton">
                <a>
                  <Skeleton width={400} />
                </a>
              </li>
            )}
          </ul>
        </nav>
        <div className="json-preview" data-testid="json-preview">
          <Tooltip
            content="JSON Preview"
            direction="top"
            dynamic={false}
            delay={200}
            status={0}
          >
            <span
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop"
              data-testid="json-preview-icon"
            >
              <img src="/json.svg" alt="JSON Preview icon" />
            </span>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
