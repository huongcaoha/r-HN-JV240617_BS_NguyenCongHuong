import { Button, DatePicker, Input, Modal, Table, Space, message } from "antd";
import React, { useState } from "react";
import moment from "moment";
const { RangePicker } = DatePicker;

export default function JobManagement() {
  const [jobs, setJobs] = useState(() => {
    return JSON.parse(localStorage.getItem("jobs")) || [];
  });
  const [showForm, setShowForm] = useState(false);
  const [inputNameJob, setInputNameJob] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [errorDate, setErrorDate] = useState("");
  const [errorJobName, setErrorJobName] = useState("");
  const [formConfirmDelete, setFormConfirmDelete] = useState(false);
  const [idDelete, setIdDelete] = useState(null);
  const [idUpdate, setIdUpdate] = useState(null);
  const [isDone, setIsDone] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);

  const jobDoings = jobs.filter((job) => job.status === false);
  const jobSuccesss = jobs.filter((job) => job.status === true);

  const handleConfirmCancel = () => {
    setFormConfirmDelete(false);
    setIdDelete(null);
    setIsUpdate(false);
  };

  const handleFormDelete = (key) => {
    setFormConfirmDelete(true);
    setIdDelete(key);
  };

  const handleConfirmOke = () => {
    handleDeleteJob();
  };

  const resetForm = () => {
    setInputNameJob("");
    setStartDate(null);
    setEndDate(null);
    setErrorDate("");
    setErrorJobName("");
  };

  const handleFormHiden = () => {
    setShowForm(false);
    resetForm();
    setIdUpdate(false);
  };

  const handleFormOpen = () => {
    setShowForm(true);
    setIsUpdate(false);
  };

  const checkDate = () => {
    let isValid = true;
    if (startDate && endDate) {
      setErrorDate("");
    } else if (!startDate || !endDate) {
      isValid = false;
    } else if (!startDate.isBefore(endDate)) {
      setErrorDate("Ngày kết thúc phải sau ngày bắt đầu");
      isValid = false;
    }
    return isValid;
  };

  const handleUpdateJob = (key) => {
    const job = jobs.find((jb) => jb.key === key);
    if (job) {
      setInputNameJob(job.taskName);
      setStartDate(moment(job.startTime, "DD-MM-YYYY HH:mm:ss"));
      setEndDate(moment(job.endTime, "DD-MM-YYYY HH:mm:ss"));
      setIdUpdate(job.key);
      setIsUpdate(true);
      setShowForm(true);
    }
  };

  const checkJobNameExist = () => {
    const checkJobName = jobs.some(
      (job) =>
        job.taskName.toLowerCase() === inputNameJob.trim().toLowerCase() &&
        job.key !== idUpdate
    );
    if (checkJobName) {
      setErrorJobName("Tên công việc đã tồn tại");
      return true;
    } else {
      setErrorJobName("");
      return false;
    }
  };

  const setValueInputNameJob = (event) => {
    setInputNameJob(event.target.value);
    checkJobNameExist();
  };

  const setValueStartDate = (date) => {
    setStartDate(date);
    checkDate();
  };

  const setValueEndDate = (date) => {
    setEndDate(date);
    checkDate();
  };

  // Hạn chế ngày
  const disabledDate = (current) => {
    const now = moment();
    const currentHour = now.hour();
    const currentMinute = now.minute();
    let today = null;
    if (currentHour >= 23 && currentMinute >= 30) {
      today = moment().add(1, "days").startOf("day");
    } else {
      today = moment().startOf("day");
    }

    return current && current < today;
  };

  // Hạn chế thời gian
  const disabledTime = () => {
    const now = moment();
    const currentHour = now.hour();
    const currentMinute = now.minute();

    return {
      disabledHours: () => {
        const hours = [];

        if (currentHour < 23) {
          for (let i = 0; i < currentHour + 1; i++) {
            hours.push(i);
          }
        }

        return hours;
      },
      disabledMinutes: (hour) => {
        const minutes = [];

        if (currentMinute >= 30) {
          for (let i = 0; i < currentMinute - 30; i++) {
            minutes.push(i);
          }
        } else {
          for (let i = 0; i < currentMinute + 30; i++) {
            minutes.push(i);
          }
        }
        return minutes;
      },
      disabledSeconds: () => {
        return [];
      },
    };
  };

  const saveJobs = (jobs) => {
    localStorage.setItem("jobs", JSON.stringify(jobs));
    setJobs(jobs);
  };

  const addJob = () => {
    const isNameValid = inputNameJob.trim() !== "" && !checkJobNameExist();
    const isDateValid = checkDate();

    if (!isNameValid || !isDateValid) {
      message.error("Không thể thêm công việc");
      return;
    }

    const newJob = {
      key: new Date().getTime(),
      taskName: inputNameJob.trim(),
      startTime: moment(startDate).format("DD-MM-YYYY HH:mm:ss"),
      endTime: moment(endDate).format("DD-MM-YYYY HH:mm:ss"),
      status: false,
    };

    const newJobs = [...jobs, newJob];
    saveJobs(newJobs);
    resetForm();
    setShowForm(false);
    message.success("Đã thêm công việc mới");
  };

  const handleDeleteJob = () => {
    const newJobs = jobs.filter((job) => job.key !== idDelete);
    saveJobs(newJobs);
    setIdDelete(null);
    setFormConfirmDelete(false);
    message.success("Xóa công việc thành công");
  };

  const updateJob = () => {
    const isNameValid = inputNameJob.trim() !== "" && !checkJobNameExist();
    const isDateValid = checkDate();

    if (!isNameValid || !isDateValid) {
      message.error("Không thể cập nhật công việc");
      return;
    }

    const newJob = {
      key: idUpdate,
      taskName: inputNameJob.trim(),
      startTime: moment(startDate).format("DD-MM-YYYY HH:mm:ss"),
      endTime: moment(endDate).format("DD-MM-YYYY HH:mm:ss"),
      status: jobs.find((job) => job.key === idUpdate).status,
    };

    const newJobs = jobs.map((job) => (job.key === idUpdate ? newJob : job));
    saveJobs(newJobs);
    resetForm();
    setShowForm(false);
    message.success("Đã sửa lại công việc");
  };

  const checkSuccess = (key) => {
    const newJobs = jobs.map((job) => {
      if (job.key === key) {
        return { ...job, status: true };
      }
      return job;
    });
    saveJobs(newJobs);
    message.success("Đánh dấu công việc thành công");
  };

  const columns = [
    {
      title: "Tên công việc",
      dataIndex: "taskName",
      key: "taskName",
      render: (_, record) => {
        const endTime = moment(record.endTime, "DD-MM-YYYY HH:mm:ss");
        const isOverdue = !isDone && moment().diff(endTime, "hours") >= 12;

        return (
          <p
            className={`p-2 ${
              isOverdue ? "bg-red-500 text-white" : "bg-transparent"
            }`}
          >
            {record.taskName}
          </p>
        );
      },
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      render: (_, record) => {
        return moment(record.startTime).format("DD/MM/YYYY HH:mm:ss");
      },
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      render: (_, record) => {
        return moment(record.endDate).format("DD/MM/YYYY HH:mm:ss");
      },
    },
    ...(isDone
      ? [
          {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
              <span className="flex justify-center gap-4">
                <Button type="primary" onClick={() => checkSuccess(record.key)}>
                  Hoàn thành
                </Button>
                <Button
                  type="default"
                  onClick={() => handleUpdateJob(record.key)}
                >
                  Sửa
                </Button>
                <Button
                  type="primary"
                  danger
                  onClick={() => handleFormDelete(record.key)}
                >
                  Xóa
                </Button>
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="bg-[#f3f4f6] w-full h-[100vh]">
      <h1 className="text-center pt-8 text-4xl font-bold">Task Manager</h1>
      <div className="flex justify-center gap-4 mt-10">
        <Button
          onClick={() => setIsDone(true)}
          type={isDone ? "primary" : "default"}
          className="text-lg h-10"
        >
          Đang Diễn Ra
        </Button>
        <Button
          onClick={() => setIsDone(false)}
          type={isDone ? "default" : "primary"}
          className="text-lg h-10"
        >
          Đã Hoàn Thành
        </Button>
      </div>

      <div className="flex justify-end mr-5">
        <Button
          className="bg-[#22c55e] text-lg h-10 text-white hover:bg-orange-400"
          type="primary"
          onClick={handleFormOpen}
        >
          Thêm Công Việc
        </Button>
      </div>

      <div className="">
        <Table
          className="mt-10 px-[200px] text-center"
          dataSource={!isDone ? jobSuccesss : jobDoings}
          columns={columns}
        />
      </div>

      <Modal
        open={showForm}
        onCancel={handleFormHiden}
        footer={[
          <Button key="back" onClick={handleFormHiden}>
            Hủy
          </Button>,
          isUpdate ? (
            <Button key="submit" type="primary" onClick={updateJob}>
              Sửa
            </Button>
          ) : (
            <Button key="submit" type="primary" onClick={addJob}>
              Thêm
            </Button>
          ),
        ]}
      >
        <div className="flex flex-col m-2">
          <label>Tên công việc :</label>
          <Input
            value={inputNameJob}
            onChange={setValueInputNameJob}
            type="text"
          />
          {errorJobName && <p className="text-red-500">{errorJobName}</p>}
        </div>

        <div className="flex flex-col m-2">
          <label>Thời gian bắt đầu :</label>
          <DatePicker
            value={startDate}
            format="DD/MM/YYYY HH:mm:ss"
            showTime
            disabledDate={disabledDate}
            disabledTime={disabledTime}
            onChange={(date) => setValueStartDate(date)}
          />
        </div>

        <div className="flex flex-col m-2">
          <label>Thời gian kết thúc :</label>
          <DatePicker
            value={endDate}
            format="DD/MM/YYYY HH:mm:ss"
            showTime
            disabledDate={disabledDate}
            disabledTime={disabledTime}
            onChange={(date) => setValueEndDate(date)}
          />
          {errorDate && <p className="text-red-500">{errorDate}</p>}
        </div>
      </Modal>

      <Modal
        title="Cảnh báo"
        open={formConfirmDelete}
        onOk={handleConfirmOke}
        onCancel={handleConfirmCancel}
      >
        <p>Bạn chắc chắn muốn xóa công việc này không?</p>
      </Modal>
    </div>
  );
}
