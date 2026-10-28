import React from "react";
import { isPlainObject } from "lodash";

interface IFieldsTable {
  entry: (Record<string, any> | string) & {
    $?: Record<string, { "data-cslp": string }>;
  };
  $?: Record<string, any>;
  emptyMultipleBlocksEnabled?: boolean;
}

export const FieldsTable = ({
  entry,
  $ = {},
  emptyMultipleBlocksEnabled = false,
}: IFieldsTable) => {
  if (!isPlainObject(entry)) {
    // Render string leaves raw; JSON.stringify quotes them (e.g. "" -> `""`),
    // which surfaces on the canvas for every multiple-field instance.
    return (
      <td {...$} data-leaf={true} data-testid={$?.["data-cslp"]}>
        {typeof entry === "string" ? entry : JSON.stringify(entry)}
      </td>
    );
  }
  return (
    <TableStructureHOC $={$}>
      <>
        {Object.entries(entry).map(([key, value]) => {
          const attributes: Record<string, any> =
            (entry as any)?.$?.[key] || {};
          if (key === "$") {
            return <React.Fragment key={key}></React.Fragment>;
          }
          if (isPlainObject(value)) {
            return (
              <tr {...attributes} key={key}>
                <td>{key}</td>
                <td>
                  <FieldsTable
                    entry={value}
                    emptyMultipleBlocksEnabled={emptyMultipleBlocksEnabled}
                  />
                </td>
              </tr>
            );
          }
          if (
            Array.isArray(value) &&
            (value.length || emptyMultipleBlocksEnabled)
          ) {
            return (
              <tr {...attributes} key={key}>
                <td>{key}</td>
                <td
                  {...attributes}
                  className={
                    value.length
                      ? undefined
                      : "visual-builder__empty-block-parent"
                  }
                  data-testid={attributes?.["data-cslp"]}
                >
                  {value.map((item, index) => {
                    const indexAttribute =
                      (entry as any)?.$?.[`${key}__${index}`] || {};
                    return (
                      <FieldsTable
                        entry={item}
                        key={index}
                        $={indexAttribute}
                        emptyMultipleBlocksEnabled={emptyMultipleBlocksEnabled}
                      />
                    );
                  })}
                </td>
              </tr>
            );
          }
          return (
            <tr key={key}>
              <td>{key}</td>
              <td {...attributes} data-testid={attributes?.["data-cslp"]}>
                {value}
              </td>
            </tr>
          );
        })}
      </>
    </TableStructureHOC>
  );
};

const TableStructureHOC = ({
  children,
  $,
}: {
  children: React.ReactNode;
  $: Record<string, any>;
}) => {
  return (
    <table {...$}>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

export default FieldsTable;
