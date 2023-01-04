import * as React from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Modal from "@mui/material/Modal"
import { Close } from "@mui/icons-material"
import { Divider, IconButton } from "@mui/material"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker"
import { useState } from "react"
import dayjs from "dayjs"
import axios from "axios"
import { useEffect } from "react"

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  // height: 400,
  // width: 800,
  bgcolor: "background.paper",
  // border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: "24px",
}

export default function AddStudent() {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [gender, setGender] = useState(null)
  const [birthDate, setBirthDate] = useState(dayjs("2000-01-01"))
  const [address, setAddress] = useState("")
  const [contactNo, setContactNo] = useState("")
  const [branches, setBranches] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [instructor, setInstructor] = useState(null)
  const [instructorOptions, setInstructorOptions] = useState(null)
  const type = "Student"

  const handleChangeDate = (newDate) => {
    setBirthDate(newDate)
  }

  const handleSubmit = async () => {
    const data = {
      email,
      password,
      passwordConfirm: confirmPassword,
      firstName,
      middleName,
      lastName,
      gender,
      birthDate,
      address,
      contactNo,
      branches,
      type,
      package: selectedPackage,
      instructorId: instructor._id
    }

    const response = await axios.post(
      `${process.env.REACT_APP_URL}/users`,
      data
    )

    console.log(response)
  }

  // Fetch Instructors
  useEffect(() => {
    if (branches) {
      const fetchInstructors = async () => {
        const response = await axios.get(`${process.env.REACT_APP_URL}/branches/${branches}/Instructor`)
        setInstructorOptions(response.data)
        setInstructor(null)
      }

      fetchInstructors()
    } else setInstructor(null)
  }, [branches])

  return (
    <div>
      <Button sx={{ width: 200 }} variant="contained" onClick={handleOpen}>
        Add Student
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            overflow={"hidden"}
          >
            <Typography
              id="modal-modal-title"
              variant="h4"
              component="h2"
              color={"#1976d2"}
              fontWeight={"bold"}
            >
              New Student
            </Typography>

            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
          <Divider sx={{ marginTop: "24px" }} />

          <Box display={"flex"} justifyContent={"space-around"}>
            <TextField
              variant="standard"
              label="E-mail"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <TextField
              variant="standard"
              label="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
            />
            <TextField
              variant="standard"
              label="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              type="password"
            />
          </Box>
          <Divider sx={{ marginTop: "24px" }} />

          <Box>
            <TextField
              variant="standard"
              label="First Name"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
            <TextField
              variant="standard"
              label="Middle Name"
              sx={{ marginLeft: "12px" }}
              onChange={(e) => setMiddleName(e.target.value)}
              value={middleName}
            />
            <TextField
              variant="standard"
              label="Last Name"
              sx={{ marginLeft: "12px" }}
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
            />
          </Box>

          <Box
            mt={"12px"}
            display={"flex"}
            justifyContent={"space-between"}
            gap={"12px"}
          >
            <Autocomplete
              sx={{ width: "40%" }}
              options={["Male", "Female"]}
              onChange={(e, newVal) => setGender(newVal)}
              isOptionEqualToValue={(option, value) => option === value}
              value={gender}
              renderInput={(params) => (
                <TextField {...params} label="Gender" variant="standard" />
              )}
            />

            <TextField
              variant="standard"
              label="Contact No."
              onChange={(e) => setContactNo(e.target.value)}
              value={contactNo}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Birthdate"
                inputFormat="MM-DD-YYYY"
                onChange={handleChangeDate}
                value={birthDate}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    sx={{ width: "50%" }}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>

          <Box mt={"12px"}>
            <TextField
              variant="standard"
              label="Address"
              fullWidth
              onChange={(e) => setAddress(e.target.value)}
              value={address}
            />
          </Box>

          <Divider sx={{ marginTop: "24px" }} />

          <Box mt={"12px"} display={"flex"} gap={"12px"}>
            <Autocomplete
              fullWidth
              // multiple
              id="branches-select"
              options={["Caloocan", "Makati", "Taguig", "Cavite"]}
              value={branches}
              onChange={(e, newVal) => setBranches(newVal)}
              isOptionEqualToValue={(option, value) => option === value}
              // getOptionLabel={(option) => option.title}
              renderInput={(params) => (
                <TextField {...params} label="Branch" variant="standard" />
              )}
            />

            <Autocomplete
              fullWidth
              disabled={!instructorOptions || !branches}
              id="instructor-select"
              options={instructorOptions}
              value={instructor}
              onChange={(e, newVal) => setInstructor(newVal)}
              // isOptionEqualToValue={(option, value) => option === value}
              getOptionLabel={(option) => option.firstName}
              renderInput={(params) => (
                <TextField {...params} label="Instructor" variant="standard" />
              )}
            />

            <Autocomplete
              fullWidth
              // multiple
              id="packages-select"
              options={["Package A", "Package B", "Package C", "Package D"]}
              value={selectedPackage}
              onChange={(e, newVal) => setSelectedPackage(newVal)}
              isOptionEqualToValue={(option, value) => option === value}
              // getOptionLabel={(option) => option.title}
              renderInput={(params) => (
                <TextField {...params} label="Package" variant="standard" />
              )}
            />
          </Box>

          <Box textAlign={"right"} mt={"24px"}>
            <Button variant="text" sx={{ color: "red" }} onClick={handleClose}>
              Close
            </Button>
            <Button variant="text" sx={{ color: "orange" }}>
              Reset
            </Button>
            <Button variant="text" onClick={() => handleSubmit()}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  )
}
