import { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Link } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Swal from "sweetalert2";
import BaseSidebar from '../partials/BaseSidebar';

function CourseCreate() {
  const [course, setCourse] = useState({
    category: "",
    file: null,
    image: { file: null, preview: "" },
    title: "",
    description: "",
    price: "",
    level: "",
    language: "",
    teacher_course_status: "",
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [category, setCategory] = useState([]);
  const [variants, setVariants] = useState([
    {
      title: "",
      items: [{
        title: "",
        description: "",
        file: null,
        preview: false,
        duration: "",
        videoType: "upload" // 'upload' or 'external'
      }],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(0);

  useEffect(() => {
    useAxios()
      .get(`course/course-category/`)
      .then((res) => {
        setCategory(res.data);
      });
  }, []);

  const handleCourseInputChange = (event) => {
    setCourse({
      ...course,
      [event.target.name]: event.target.value,
    });
  };

  const handleCkEditorChange = (event, editor) => {
    const data = editor.getData();
    setCourse({ ...course, description: data });
  };


  const handleCourseImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourse({
          ...course,
          image: {
            file: file,
            preview: reader.result,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCourseIntroVideoChange = (event) => {
    setCourse({
      ...course,
      file: event.target.files[0],
    });
  };

  const handleVariantChange = (index, propertyName, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][propertyName] = value;
    setVariants(updatedVariants);
  };

  const handleItemChange = (variantIndex, itemIndex, propertyName, value) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].items[itemIndex][propertyName] = value;
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        title: "",
        items: [{
          title: "",
          description: "",
          file: null,
          preview: false,
          duration: "",
          videoType: "upload"
        }],
      },
    ]);
    setActiveAccordion(variants.length);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      const updatedVariants = [...variants];
      updatedVariants.splice(index, 1);
      setVariants(updatedVariants);
      setActiveAccordion(Math.min(index, updatedVariants.length - 1));
    } else {
      Swal.fire({
        icon: "warning",
        title: "Cannot remove",
        text: "You must have at least one section",
      });
    }
  };

  const addItem = (variantIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].items.push({
      title: "",
      description: "",
      file: null,
      preview: false,
      duration: "",
      videoType: "upload"
    });
    setVariants(updatedVariants);
  };

  const removeItem = (variantIndex, itemIndex) => {
    const updatedVariants = [...variants];
    if (updatedVariants[variantIndex].items.length > 1) {
      updatedVariants[variantIndex].items.splice(itemIndex, 1);
      setVariants(updatedVariants);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Cannot remove",
        text: "Each section must have at least one lesson",
      });
    }
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formdata = new FormData();
      formdata.append("title", course.title);
      formdata.append("image", course.image.file);
      formdata.append("description", course.description);
      formdata.append("category", course.category);
      formdata.append("price", course.price);
      formdata.append("level", course.level);
      formdata.append("language", course.language);
      formdata.append("teacher", parseInt(UserData()?.teacher_id));

      if (course.file) {
        formdata.append("file", course.file);
      }

      variants.forEach((variant, variantIndex) => {
        formdata.append(`variants[${variantIndex}][title]`, variant.title);

        variant.items.forEach((item, itemIndex) => {
          formdata.append(
            `variants[${variantIndex}][items][${itemIndex}][title]`,
            item.title
          );
          formdata.append(
            `variants[${variantIndex}][items][${itemIndex}][description]`,
            item.description
          );
          if (item.file) {
            formdata.append(
              `variants[${variantIndex}][items][${itemIndex}][file]`,
              item.file
            );
          }
          formdata.append(
            `variants[${variantIndex}][items][${itemIndex}][preview]`,
            item.preview.toString()
          );
          formdata.append(
            `variants[${variantIndex}][items][${itemIndex}][duration]`,
            item.duration
          );
          formdata.append(
            `variants[${variantIndex}][items][${itemIndex}][videoType]`,
            item.videoType
          );
        });
      });

      await useAxios().post(`teacher/course-create/`, formdata);

      Swal.fire({
        icon: "success",
        title: "Course Created Successfully",
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        window.location.href = "/instructor/courses/";
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "An error occurred while creating the course",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex">
      <BaseSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={UserData()}
      />

      <div className="main-content flex-grow-1">
        <div className="container-fluid py-4 px-4">
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 mb-0">Create New Course</h1>
              <p className="mb-0 text-muted">Fill out the form to create your new course</p>
            </div>
            <div>
              <Link
                to="/instructor/dashboard/"
                className="btn btn-outline-secondary me-2"
              >
                <i className="fas fa-arrow-left me-2"></i>Back to Courses
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Information Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h4 className="mb-0">Basic Information</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Course Thumbnail */}
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">Course Thumbnail</label>
                    <div className="border rounded-3 p-3 text-center mb-3">
                      <img
                        className="img-fluid rounded-2"
                        style={{
                          maxHeight: "200px",
                          objectFit: "cover",
                        }}
                        src={
                          course.image.preview ||
                          "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"
                        }
                        alt="Course thumbnail"
                      />
                    </div>
                    <input
                      className="form-control"
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleCourseImageChange}
                      required
                    />
                    <small className="text-muted">
                      Recommended size: 1280x720 pixels (Max 2MB)
                    </small>
                  </div>

                  {/* Course Details */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Course Title</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="e.g. Advanced JavaScript Techniques"
                        name="title"
                        onChange={handleCourseInputChange}
                        required
                        maxLength="60"
                      />
                      <small className="text-muted">
                        Keep it concise and descriptive (60 characters max)
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Category</label>
                      <select
                        className="form-select"
                        name="category"
                        onChange={handleCourseInputChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {category?.map((c, index) => (
                          <option key={index} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Level</label>
                        <select
                          className="form-select"
                          onChange={handleCourseInputChange}
                          name="level"
                          required
                        >
                          <option value="">Select level</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="All Levels">All Levels</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Language</label>
                        <select
                          className="form-select"
                          onChange={handleCourseInputChange}
                          name="language"
                          required
                        >
                          <option value="">Select Language</option>
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Price ($)</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          className="form-control"
                          type="number"
                          onChange={handleCourseInputChange}
                          name="price"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Intro Video</label>
                      <input
                        className="form-control"
                        type="file"
                        name="file"
                        accept="video/*"
                        onChange={handleCourseIntroVideoChange}
                      />
                      <small className="text-muted">
                        Short video introducing your course (optional, Max 100MB)
                      </small>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Course Description</label>
                  <textarea
                    className="form-control"
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    rows="10"
                  />
                  <small className="text-muted">
                    A detailed description of what students will learn (Minimum 200 characters)
                  </small>
                </div>
              </div>
            </div>

            {/* Curriculum Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Curriculum</h4>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={addVariant}
                  >
                    <i className="fas fa-plus me-2"></i>Add Section
                  </button>
                </div>
              </div>
              <div className="card-body">
                {variants.map((variant, variantIndex) => (
                  <div key={variantIndex} className="mb-4">
                    <div className="accordion-item border-0">
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${activeAccordion === variantIndex ? '' : 'collapsed'}`}
                          type="button"
                          onClick={() => toggleAccordion(variantIndex)}
                        >
                          <div className="d-flex align-items-center w-100">
                            <span className="fw-bold me-3">
                              Section {variantIndex + 1}:
                            </span>
                            <input
                              type="text"
                              placeholder="Section Title (e.g. 'Getting Started')"
                              className="form-control border-0 shadow-none bg-transparent p-0 flex-grow-1"
                              value={variant.title}
                              onChange={(e) =>
                                handleVariantChange(
                                  variantIndex,
                                  "title",
                                  e.target.value
                                )
                              }
                              required
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeVariant(variantIndex);
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </button>
                      </h2>
                      <div className={`accordion-collapse collapse ${activeAccordion === variantIndex ? 'show' : ''}`}>
                        <div className="accordion-body pt-3">
                          {variant.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="card mb-3 border">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h5 className="mb-0">Lesson {itemIndex + 1}</h5>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeItem(variantIndex, itemIndex)}
                                  >
                                    <i className="fas fa-trash me-2"></i>Remove
                                  </button>
                                </div>

                                <div className="mb-3">
                                  <label className="form-label fw-bold">Lesson Title</label>
                                  <input
                                    type="text"
                                    placeholder="Lesson title"
                                    className="form-control"
                                    value={item.title}
                                    onChange={(e) =>
                                      handleItemChange(
                                        variantIndex,
                                        itemIndex,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    required
                                  />
                                </div>

                                <div className="mb-3">
                                  <label className="form-label fw-bold">Lesson Description</label>
                                  <CKEditor
                                    editor={ClassicEditor}
                                    data={item.description}
                                    onChange={(event, editor) => {
                                      const data = editor.getData();
                                      handleItemChange(
                                        variantIndex,
                                        itemIndex,
                                        "description",
                                        data
                                      );
                                    }}
                                    config={{
                                      toolbar: [
                                        'bold', 'italic', 'link', 'bulletedList', 'numberedList',
                                        'undo', 'redo'
                                      ]
                                    }}
                                  />
                                </div>

                                <div className="row">
                                  <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">Video Type</label>
                                    <select
                                      className="form-select"
                                      value={item.videoType}
                                      onChange={(e) =>
                                        handleItemChange(
                                          variantIndex,
                                          itemIndex,
                                          "videoType",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="upload">Upload Video</option>
                                      <option value="external">External URL</option>
                                    </select>
                                  </div>
                                  <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">Duration (minutes)</label>
                                    <input
                                      type="number"
                                      className="form-control"
                                      placeholder="e.g. 45"
                                      value={item.duration}
                                      onChange={(e) =>
                                        handleItemChange(
                                          variantIndex,
                                          itemIndex,
                                          "duration",
                                          e.target.value
                                        )
                                      }
                                      min="1"
                                    />
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <label className="form-label fw-bold">
                                    {item.videoType === 'upload' ? 'Video File' : 'Video URL'}
                                  </label>
                                  {item.videoType === 'upload' ? (
                                    <input
                                      type="file"
                                      className="form-control"
                                      accept="video/*"
                                      onChange={(e) =>
                                        handleItemChange(
                                          variantIndex,
                                          itemIndex,
                                          "file",
                                          e.target.files[0]
                                        )
                                      }
                                    />
                                  ) : (
                                    <input
                                      type="url"
                                      className="form-control"
                                      placeholder="https://youtube.com/embed/..."
                                      onChange={(e) =>
                                        handleItemChange(
                                          variantIndex,
                                          itemIndex,
                                          "file",
                                          e.target.value
                                        )
                                      }
                                    />
                                  )}
                                  <small className="text-muted">
                                    {item.videoType === 'upload'
                                      ? 'MP4 format recommended (Max 500MB)'
                                      : 'Embed URL from YouTube, Vimeo, etc.'}
                                  </small>
                                </div>

                                <div className="form-check form-switch mb-3">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`preview-${variantIndex}-${itemIndex}`}
                                    checked={item.preview}
                                    onChange={(e) =>
                                      handleItemChange(
                                        variantIndex,
                                        itemIndex,
                                        "preview",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label className="form-check-label" htmlFor={`preview-${variantIndex}-${itemIndex}`}>
                                    Mark as Free Preview
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            className="btn btn-outline-primary w-100"
                            onClick={() => addItem(variantIndex)}
                          >
                            <i className="fas fa-plus me-2"></i>Add Lesson to This Section
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary btn-lg py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Course...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2"></i>Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CourseCreate;