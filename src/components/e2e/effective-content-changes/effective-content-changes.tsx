import React, { useEffect, useState } from "react";
import { useLivePreviewCtx } from "../../../context/live-preview-context-provider";
import { useParams } from "react-router-dom";
import parse from "html-react-parser";
import { getEffectiveContentChangesPageRes } from "../../../helper/e2e-helper";
import "./styles.scss";

type Link = {
  title: string;
  href: string;
};

type Level1Block = {
  $: any;
  single_line: string;
  rich_text_editor: string;
  group_nesting: {
    $: any;
    single_line: string;
    rich_text_editor: string;
  };
};

type Block = {
  $: any;
  level1: Level1Block;
};

type Block2 = {
  $: any;
  block: {
    $: any;
    single_line: string;
  };
};

type ECCEntry = {
  $: any;
  uid: string;
  locale: string;
  single_line: string;
  single_line_multiple: string[];
  multi_line: string;
  rich_text_editor: string;
  rich_text_editor_multiple: string[];
  json_rte: string;
  number: number;
  date: string;
  link: Link;
  modular_blocks_nesting: Block[];
  modular_blocks_nesting_2: Block2[];
};

export default function EffectiveContentChanges(props: { ctUid: string }) {
  const { ctUid } = props;
  const lpTs = useLivePreviewCtx();
  const [entry, setEntry] = useState({} as ECCEntry);
  const params = useParams();

  async function fetchData() {
    const result = await getEffectiveContentChangesPageRes(
      ctUid,
      params.locale ?? "en-us",
    );
    if (!result) return;
    setEntry({ ...result });
  }

  useEffect(() => {
    fetchData();
  }, [lpTs]);

  return entry.$ ? (
    <div
      className="e2e-effective-content-changes-container"
      data-testid="effective-content-changes-container"
    >
      <p {...entry.$["single_line"]}>{entry.single_line}</p>
      <p {...entry.$["multi_line"]}>{entry.multi_line}</p>
      <p {...entry.$["rich_text_editor"]}>
        {entry.rich_text_editor && parse(entry.rich_text_editor)}
      </p>
      <p {...entry.$["json_rte"]}>{entry.json_rte && parse(entry.json_rte)}</p>
      <p {...entry.$["number"]}>{entry.number}</p>
      <p {...entry.$["date"]}>{entry.date}</p>
      <button {...entry.$["link"]}>{entry.link.title}</button>
      <div {...entry.$[`single_line_multiple`]}>
        {entry.single_line_multiple.map((singleLine, index) => (
          <p {...entry.$[`single_line_multiple__${index}`]}>{singleLine}</p>
        ))}
      </div>
      <div {...entry.$[`rich_text_editor_multiple`]}>
        {entry.rich_text_editor_multiple.map((rte, index) => (
          <p {...entry.$[`rich_text_editor_multiple__${index}`]}>
            {rte && parse(rte)}
          </p>
        ))}
      </div>
      <div
        {...entry.$[`modular_blocks_nesting`]}
        className={
          entry.modular_blocks_nesting.length === 0
            ? "visual-builder__empty-block-parent"
            : ""
        }
      >
        {entry.modular_blocks_nesting.map((block, index) => (
          <div {...block.$[`level1`]}>
            <p {...block.level1.$["single_line"]}>{block.level1.single_line}</p>
            <div {...block.level1.$["group_nesting"]}>
              <p {...block.level1.group_nesting.$["single_line"]}>
                {block.level1.group_nesting.single_line}
              </p>
              <p {...block.level1.group_nesting.$["rich_text_editor"]}>
                {block.level1.group_nesting.rich_text_editor &&
                  parse(block.level1.group_nesting.rich_text_editor)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
}
