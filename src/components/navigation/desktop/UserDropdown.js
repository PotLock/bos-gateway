import React, { useEffect, useState } from "react";
import { Widget, useNear, useAccount } from "near-social-vm";
import { Contract, connect } from "near-api-js";

import styled from "styled-components";
import { User } from "../../icons/User";
import { LogOut } from "../../icons/LogOut";
import { Code } from "../../icons/Code";
import { NavLink, Link } from "react-router-dom";
import { NotificationWidget } from "../NotificationWidget";

const StyledDropdown = styled.div`
  button,
  a {
    font-weight: var(--font-weight-medium);
  }
  .dropdown-toggle {
    display: flex;
    align-items: center;
    text-align: left;
    background-color: var(--slate-dark-5);
    border-radius: 50px;
    outline: none;
    border: 0;

    &:after {
      margin: 0 15px;
      border-top-color: var(--slate-dark-11);
    }

    img {
      border-radius: 50% !important;
    }

    .profile-info {
      margin: 5px 10px;
      line-height: normal;
      max-width: 140px;
      font-size: 12px;
      @media only screen and (max-width: 920px) {
        display: none;
      }
      .profile-name,
      .profile-username {
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .profile-name {
        color: var(--slate-dark-12);
      }
      .profile-username {
        color: var(--slate-dark-11);
      }
    }
  }

  ul {
    background-color: var(--slate-dark-5);
    width: 100%;

    li {
      padding: 0 6px;
    }

    button,
    a {
      color: var(--slate-dark-11);
      font-size: 14px;
      display: flex;
      align-items: center;
      border-radius: 8px;
      padding: 12px;
      outline: none;
      border: none;
      background: transparent;
      width: 100%;
      :hover,
      :focus {
        text-decoration: none;
        background-color: var(--slate-dark-1);
        color: white;
        i {
          color: white;
        }
        svg {
          path {
            stroke: white;
          }
        }
      }

      svg {
        margin-right: 7px;
        min-width: 24px;
        path {
          stroke: var(--slate-dark-9);
        }
      }
    }
  }
`;

export function UserDropdown(props) {
  const near = useNear();
  const account = useAccount();

  const [projectStatus, setProjectStatus] = useState("");

  useEffect(() => {
    (async function () {
      if (account.accountId) {
        const connectionConfig = {
          networkId: "mainnet",
          keyStore: near.keyStore,
          nodeUrl: "https://rpc.mainnet.near.org",
          helperUrl: "https://helper.mainnet.near.org",
          explorerUrl: "https://explorer.mainnet.near.org",
        };

        // // connect to NEAR
        const nearConnection = await connect(connectionConfig);
        const accountConnection = await nearConnection.account();

        const contract = new Contract(
          accountConnection,
          "registry.potlock.near",
          {
            viewMethods: ["get_project_by_id"],
          }
        );

        try {
          const project = await contract.get_project_by_id({
            project_id: account.accountId,
          });
          setProjectStatus(project.status);
        } catch {
          setProjectStatus(false);
        }
      }
    })();
  }, []);

  return (
    <>
      <StyledDropdown className="dropdown">
        <button
          className="dropdown-toggle"
          type="button"
          id="dropdownMenu2222"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <Widget
            src={props.widgets.profileImage}
            props={{
              accountId: account.accountId,
              className: "d-inline-block",
              style: { width: "30px", height: "30px" },
            }}
          />
          <div className="profile-info">
            {props.widgets.profileName && (
              <div className="profile-name">
                <Widget src={props.widgets.profileName} />
              </div>
            )}
            <div className="profile-username">{account.accountId}</div>
          </div>
        </button>
        <ul
          className="dropdown-menu"
          aria-labelledby="dropdownMenu2222"
          style={{ minWidth: "fit-content" }}
        >
          <li>
            <NavLink
              type="button"
              to={
                projectStatus
                  ? `/?tab=project&projectId=${account.accountId}`
                  : `/?tab=profile&accountId=${account.accountId}`
              }
            >
              <User />
              {projectStatus
                ? projectStatus === "Approved"
                  ? "My Project"
                  : `My Project (${projectStatus})`
                : "My Profile"}
            </NavLink>
          </li>
          {props.widgetSrc?.view && (
            <li>
              <Link
                to={`/${props.widgets.viewSource}?src=${props.widgetSrc?.view}`}
              >
                <Code />
                View source
              </Link>
            </li>
          )}
          {props.signedIn && (
            <li>
              <button>
                <NotificationWidget
                  notificationButtonSrc={props.widgets.notificationButton}
                />
                Notifications
              </button>
            </li>
          )}
          <li>
            <button
              className="dropdown-item"
              type="button"
              onClick={() => props.logOut()}
            >
              <LogOut />
              Sign Out
            </button>
          </li>
        </ul>
      </StyledDropdown>
    </>
  );
}
