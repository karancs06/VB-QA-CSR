import React from "react";
import Skeleton from "react-loading-skeleton";
import { NavLink, Link } from "react-router-dom";
import parse from "html-react-parser";
import { FooterProps, NavmenuProps, Social } from "../typescript/layout";

export default function Footer({
  footer,
  navMenu,
}: {
  footer: FooterProps;
  navMenu: NavmenuProps;
}) {
  return (
    <footer data-testid="footer" id="footer">
      {/* TODO: remove changes from this file when merging this to development */}
      <div className="max-width footer-div" data-testid="footer-div">
        <div className="col-quarter" data-testid="footer-logo-container">
          <Link
            {...(footer.logo?.$?.url as unknown as object)}
            to="/"
            data-testid="footer-logo-link"
          >
            {footer.logo ? (
              <img
                {...(footer.$?.logo as unknown as object)}
                src={footer.logo.url}
                alt="contentstack logo"
                title="contentstack"
                className="logo footer-logo"
                data-testid="footer-logo"
              />
            ) : (
              <Skeleton width={100} data-testid="footer-logo-skeleton" />
            )}
          </Link>
        </div>
        <div className="col-half" data-testid="footer-nav-container">
          <nav data-testid="footer-nav">
            <ul
              {...(footer.navigation?.$?.link as unknown as object)}
              className="nav-ul"
              data-testid="footer-nav-ul"
            >
              {navMenu.length ? (
                navMenu?.map((link, index) => (
                  <li
                    {...((footer.navigation.link.length > index
                      ? footer.navigation.$[`link__${index}`]
                      : "") as unknown as object)}
                    key={`footer-nav-li-${index}`}
                    className="footer-nav-li"
                    data-testid={`footer-nav-li-${index}`}
                  >
                    <NavLink
                      to={link.href}
                      data-testid={`footer-nav-link-${index}`}
                    >
                      <span
                        {...((footer.navigation.link.length <= index
                          ? link.$.title
                          : "") as unknown as object)}
                        data-testid={`footer-nav-link-title-${index}`}
                      >
                        {link.title}
                      </span>
                    </NavLink>
                  </li>
                ))
              ) : (
                <li
                  className="footer-nav-li"
                  data-testid="footer-nav-li-skeleton"
                >
                  <Skeleton width={200} data-testid="footer-nav-skeleton" />
                </li>
              )}
            </ul>
          </nav>
        </div>
        <div
          className="col-quarter social-link"
          data-testid="footer-social-container"
        >
          <div
            className="social-nav"
            {...footer?.social?.$?.social_share}
            data-testid="footer-social-nav"
          >
            {Object.keys(footer).length ? (
              footer.social.social_share?.map((social: Social, index) => (
                <a
                  href={social.link.href}
                  title={social.link.title}
                  key={`social-share-${index}`}
                  {...footer?.social?.$?.["social_share__" + index]}
                  data-testid={`footer-social-link-${index}`}
                >
                  <img
                    {...(social.icon?.$?.url as unknown as object)}
                    src={social.icon?.url}
                    alt="social icon"
                    data-testid={`footer-social-icon-${index}`}
                  />
                </a>
              ))
            ) : (
              <a data-testid="footer-social-skeleton">
                <Skeleton
                  width={100}
                  data-testid="footer-social-icon-skeleton"
                />
              </a>
            )}
          </div>
        </div>
      </div>
      {footer.copyright ? (
        <div
          className="copyright"
          {...(footer?.$?.copyright as unknown as object)}
          data-testid="footer-copyright"
        >
          {parse(footer.copyright)}
        </div>
      ) : (
        <div className="copyright" data-testid="footer-copyright-skeleton">
          <Skeleton width={500} data-testid="footer-copyright-skeleton-width" />
        </div>
      )}
    </footer>
  );
}
