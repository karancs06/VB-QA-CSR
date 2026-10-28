import React, { useEffect, useState } from "react";
import { useLivePreviewCtx } from "../../../context/live-preview-context-provider";
import { useParams } from "react-router-dom";
import parse from "html-react-parser";
import { getAiAssistantPageRes } from "../../../helper/e2e-helper";
import "./styles.scss";

type Level1Block = {
  $: any;
  json_rte?: any;
  modular_block_2?: {
    level2?: Level2Block;
  }[];
  multi_line?: string;
};

type Level2Block = {
  $: any;
  json_rte?: any;
  multi_line?: string;
};

type TestPageEntry = {
  $: any;
  title: string;
  url: string;
  uid: string;
  single_line?: string;
  multi_line?: string;
  rich_text_editor?: any;
  json_rte?: any;
  markdown?: string;
  group?: {
    $: any;
    json_rte?: any;
    multi_line?: string;
  };
  modular_blocks?: {
    level1?: Level1Block;
  }[];
  locale: string;
};

export default function AiAssistant({ entryUrl }: { entryUrl: string }) {
  const lpTs = useLivePreviewCtx();
  const [entry, setEntry] = useState({} as TestPageEntry);
  const params = useParams();

  async function fetchData() {
    const result = await getAiAssistantPageRes(
      entryUrl,
      params.locale ?? "en-us",
    );
    if (!result) return;
    setEntry({ ...result });
  }

  useEffect(() => {
    fetchData();
  }, [lpTs]);

  return (
    <div className="e2e-ai-assistant-container">
      <h2 data-testid="title">{entry.title}</h2>
      <p data-testid="single_line">{entry.single_line}</p>
      <p data-testid="multi_line">{entry.multi_line}</p>
      <p data-testid="rich_text_editor">
        {entry.rich_text_editor && parse(entry.rich_text_editor)}
      </p>
      <p data-testid="json_rte">{entry.json_rte && parse(entry.json_rte)}</p>
      <p
        data-testid="markdown"
        dangerouslySetInnerHTML={{ __html: entry.markdown ?? "" }}
      ></p>
      <div>
        <p data-testid="group.multi_line">{entry.group?.multi_line}</p>
        <p data-testid="group.json_rte">
          {entry.group?.json_rte && parse(entry.group?.json_rte ?? "")}
        </p>
      </div>
      <div>
        {entry.modular_blocks?.map((block) => (
          <div>
            <p data-testid="modular_blocks.0.level1.json_rte">
              {block.level1?.json_rte && parse(block.level1?.json_rte ?? "")}
            </p>
            <p data-testid="modular_blocks.0.level1.multi_line">
              {block.level1?.multi_line}
            </p>
            <div>
              {block.level1?.modular_block_2?.map((block2) => (
                <div>
                  <p data-testid="modular_blocks.0.level1.modular_block_2.0.level2.json_rte">
                    {block2.level2?.json_rte &&
                      parse(block2.level2?.json_rte ?? "")}
                  </p>
                  <p data-testid="modular_blocks.0.level1.modular_block_2.0.level2.multi_line">
                    {block2.level2?.multi_line}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
