import React from "react";
import { TeamProps } from "../typescript/section";
import { getMultilineHTML } from "../helper";

export default function TeamSection({ ourTeam }: { ourTeam: TeamProps }) {
  return (
    <div className="about-team-section" data-testid="about-team-section">
      <div className="team-head-section" data-testid="team-head-section">
        {ourTeam.title_h2 && (
          <h2 {...(ourTeam?.$?.title_h2 as {})} data-testid="team-title">
            {ourTeam.title_h2}
          </h2>
        )}
        {ourTeam.description ? (
          <p
            {...(ourTeam?.$?.description as {})}
            dangerouslySetInnerHTML={getMultilineHTML(ourTeam.description)}
            data-testid="team-description"
          ></p>
        ) : (
          ""
        )}
      </div>
      <div className="team-content" data-testid="team-content">
        {ourTeam.employees?.map((employee, index) => {
          return (
            <div
              className="team-details"
              key={`team-details-${index}`}
              data-testid={`team-details-${index}`}
            >
              {employee.image && (
                <img
                  {...(employee.image?.$?.url as {})}
                  alt={employee.image.filename}
                  src={employee.image.url}
                  data-testid={`employee-image-${index}`}
                />
              )}
              <div
                className="team-details"
                data-testid={`employee-details-${index}`}
              >
                {employee.name && (
                  <h4
                    {...(employee?.$?.name as {})}
                    data-testid={`employee-name-${index}`}
                  >
                    {employee.name}
                  </h4>
                )}
                {employee.designation && (
                  <p
                    {...(employee?.$?.designation as {})}
                    data-testid={`employee-designation-${index}`}
                  >
                    {employee.designation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
