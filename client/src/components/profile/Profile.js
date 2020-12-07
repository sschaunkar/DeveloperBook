import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";
import { Spinner } from "../layout/Spinner";
import { getProfileById } from "../../actions/profile";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import ProfileTop from "./ProfileTop";

const Profile = ({
  getProfileById,
  profile: { profile, loading },
  auth,
  match,
}) => {
  useEffect(() => {
    getProfileById(match.params.id);
  }, [getProfileById, match.params.id]);
  return (
    <Fragment>
      {profile === null || loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <Link to="/profiles" className="btn btn-light">
            Go Back to Profiles
          </Link>
          {auth.isAuthenticated &&
            auth.loading === false &&
            auth.user._id === profile.user._id && (
              <Link to="/edit-profile" className="btn btn-dark">
                Edit Profile
              </Link>
            )}
          <div className="profile-grid my-1">
            <ProfileTop profile={profile} />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

Profile.propTypes = {
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  getProfileById: PropTypes.func.isRequired,
};

const mapStatetoProps = (state) => ({
  profile: state.profile,
  auth: state.auth,
});

export default connect(mapStatetoProps, { getProfileById })(Profile);
