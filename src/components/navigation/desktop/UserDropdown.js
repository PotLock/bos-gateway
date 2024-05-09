import React, { useEffect, useState } from "react";
import { Widget, useNear, useAccount } from "near-social-vm";
import { Contract, connect } from "near-api-js";
import styled from "styled-components";
import { User } from "../../icons/User";
import { LogOut } from "../../icons/LogOut";
import { Code } from "../../icons/Code";
import { NavLink, Link } from "react-router-dom";
import { NotificationWidget } from "../NotificationWidget";
import statuses from "./statuses";

const StyledDropdown = styled.div`
  button,
  a {
    font-weight: var(--font-weight-medium);
  }
  .toggle {
    position: relative;
    outline: none;
    border: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    background: transparent;
    cursor: pointer;
    padding: 0;
    .profile-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  ul {
    background: white;
    color: #292929;
    box-shadow: 0px 0px 0px 1px rgba(55, 55, 55, 0.04),
      0px 14px 20px -6px rgba(15, 15, 15, 0.15),
      0px 5px 20px -2px rgba(5, 5, 5, 0.08);
    border-radius: 12px;
    width: 250px;
    padding: 0.5rem;

    button,
    a {
      background: transparent;
      color: #292929;
      font-size: 14px;
      display: flex;
      align-items: center;
      border-radius: 8px;
      outline: none;
      border: none;
      width: 100%;
      padding: 0.5rem;

      svg {
        margin-right: 7px;
        width: 24px;
        path {
          stroke: var(--slate-dark-9);
        }
      }
      .logout-icon path {
        stroke: #dd3345;
      }
      :hover,
      :focus {
        text-decoration: none;
        background: #292929;
        color: white !important;
        i {
          color: white;
        }
        svg {
          path {
            stroke: white;
          }
        }
      }
    }
  }
`;

const ProjectStatus = styled.div`
  position: absolute;
  width: 1rem;
  height: 1rem;
  display: flex;
  background: white;
  bottom: 0;
  right: 0;
  padding: 2px;
  transform: translateX(10px);
  border-radius: 50%;
  svg {
    height: 100%;
    width: fit-content;
  }
`;

const ProfileInfo = styled.div`
  pad: 0.5rem;
  display: flex;
  gap: 1rem;
  .profile-image {
    width: 40px;
    height: 40px;
    display: flex;
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .profile-name {
    font-weight: 600;
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 175px;
  }
  .profile-username {
    color: #656565;
    font-weight: 500;
  }
`;

const DropdownStatus = styled.div`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  svg,
  img {
    width: 13px;
  }
`;

const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid rgba(55, 55, 55, 0.04);
  margin-top: 0.5rem;
  gap: 4px;
`;

const LIST_CONTRACT_ID = "lists.potlock.near";
const NADABOT_CONTRACT_ID = "v1.nadabot.near";

const _address = (address, max) => {
  const limit = max || 15;
  if (address.length > limit) return address.slice(0, limit) + "...";
  else return address;
};

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

        const listContract = new Contract(accountConnection, LIST_CONTRACT_ID, {
          viewMethods: ["get_registration", "get_registrations_for_registrant"],
        });

        try {
          const registrations =
            await listContract.get_registrations_for_registrant({
              registrant_id: account.accountId,
            });
          if (registrations.length > 0) {
            const registration = registrations.find(
              (registration) => registration.list_id === 1
            );
            setProjectStatus(registration.status);
          } else {
            const nadabotContract = new Contract(
              accountConnection,
              NADABOT_CONTRACT_ID,
              {
                viewMethods: ["is_human"],
              }
            );
            const isUserHumanVerified = await nadabotContract.is_human({
              account_id: account.accountId,
            });
            setProjectStatus(isUserHumanVerified ? "Human Verified" : false);
          }
        } catch (err) {
          console.log("err", err);
          setProjectStatus(false);
        }
      }
    })();
  }, []);

  const isDonor = !projectStatus || projectStatus === "Human Verified";

  const ProfileImage = () => (
    <Widget
      src={props.widgets.profileImage}
      props={{
        accountId: account.accountId,
        className: "profile-image",
        style: {},
      }}
    />
  );

  return (
    <>
      <StyledDropdown className="dropdown">
        <button
          className="toggle"
          type="button"
          id="dropdownMenu2222"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <ProfileImage />

          {projectStatus && (
            <ProjectStatus>{statuses[projectStatus].icon}</ProjectStatus>
          )}
        </button>
        <ul
          className="dropdown-menu dropdown-menu-right"
          aria-labelledby="dropdownMenu2222"
        >
          <li>
            <ProfileInfo>
              <ProfileImage />

              <div className="info">
                {props.widgets.profileName && (
                  <Widget src={props.widgets.profileName} />
                )}
                <div className="profile-username">
                  {_address(account.accountId)}
                </div>
              </div>
            </ProfileInfo>
          </li>
          <DropdownContainer>
            {projectStatus && (
              <li>
                <DropdownStatus
                  style={{
                    color: statuses[projectStatus]?.color,
                    background: statuses[projectStatus]?.background,
                  }}
                >
                  <div>{projectStatus}</div> {statuses[projectStatus]?.icon}
                </DropdownStatus>
              </li>
            )}
            <li>
              <NavLink
                type="button"
                to={
                  isDonor
                    ? `/?tab=profile&accountId=${account.accountId}`
                    : `/?tab=project&projectId=${account.accountId}`
                }
              >
                <User />
                {isDonor ? "My Profile" : `My Project`}
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
            <li>
              <button>
                <NotificationWidget
                  notificationButtonSrc={props.widgets.notificationButton}
                />
                Notifications
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                type="button"
                style={{
                  color: "#DD3345",
                }}
                onClick={() => props.logOut()}
              >
                <LogOut />
                Sign Out
              </button>
            </li>
          </DropdownContainer>
        </ul>
      </StyledDropdown>
    </>
  );
}
