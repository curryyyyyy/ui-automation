import { target, type LocatorTarget } from '../../../framework/core/locator.js';

type SsoLoginSelectors = {
  username: string;
  password: string;
};

/** SSO 登录页元素定位，仅维护该页面的元素资产。 */
export function ssoLoginLocators(selectors: SsoLoginSelectors): {
  username: LocatorTarget;
  password: LocatorTarget;
  submit: LocatorTarget;
} {
  return {
    username: target.css(selectors.username),
    password: target.css(selectors.password),
    submit: target.role('button', /^\s*登\s*录\s*$/),
  };
}
