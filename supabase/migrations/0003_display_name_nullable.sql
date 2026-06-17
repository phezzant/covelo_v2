-- Name is now collected during the profile step of onboarding rather than at
-- role-selection, so a profile can exist briefly without a display_name.
alter table profiles alter column display_name drop not null;
