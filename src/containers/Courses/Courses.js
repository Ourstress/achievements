import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { firebaseConnect } from "react-redux-firebase";
import { compose } from "redux";
import { LinearProgress } from "material-ui/Progress";
import Toolbar from "material-ui/Toolbar";
import Button from "material-ui/Button";
import {
  courseHideNewdialog,
  courseNewDialogChange,
  courseShowNewDialog
} from "./actions";
import { AddCourseDialog } from "../../components/AddCourseDialog";
import CoursesTable from "../../components/CoursesTable";

class Courses extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    showNewDialog: PropTypes.bool,
    newCourseValues: PropTypes.object,
    courses: PropTypes.any,
    firebase: PropTypes.object,
    instructorName: PropTypes.string,
    ownerId: PropTypes.string
  };

  showNewCourseDialog = () => {
    this.props.dispatch(courseShowNewDialog());
  };
  closeNewCourseDialog = () => {
    this.props.dispatch(courseHideNewdialog());
  };
  newDialogRequest = () => {
    /*
    const { name, password } = this.props.newCourseValues;
    this.props.dispatch(courseNewRequest(name, password));
    */

    this.props.firebase.push("courses", {
      name: this.props.newCourseValues.name,
      password: this.props.newCourseValues.password
    });
  };
  onDialogFieldChange = (field, value) => {
    this.props.dispatch(courseNewDialogChange(field, value));
  };
  render() {
    if (!this.props.courses) {
      return <LinearProgress />;
    }

    return (
      <Fragment>
        <Toolbar>
          <Button raised onClick={() => this.showNewCourseDialog()}>
            Add new course
          </Button>
        </Toolbar>
        <CoursesTable courses={this.props.courses || {}} />
        <AddCourseDialog
          values={this.props.newCourseValues}
          onFieldChange={this.onDialogFieldChange}
          requestCreation={this.newDialogRequest}
          open={this.props.showNewDialog}
          requestClose={this.closeNewCourseDialog}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  courses: state.firebase.data.courses,
  instructorName: state.firebase.auth.displayName,
  ownerId: state.firebase.auth.uid,
  showNewDialog: state.courses.showNewDialog,
  newCourseValues: state.courses.newCourseValues
});

export default compose(firebaseConnect(["courses"]), connect(mapStateToProps))(
  Courses
);
