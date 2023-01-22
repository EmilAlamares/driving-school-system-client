import * as React from "react"
import PropTypes from "prop-types"
import Box from "@mui/material/Box"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import { Close } from "@mui/icons-material"
import { Divider, IconButton, Modal } from "@mui/material"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import TableSortLabel from "@mui/material/TableSortLabel"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import AddInstructor from "./AddInstructor"
import LinearProgress from "@mui/material/LinearProgress"
import { useState, useEffect } from "react"
import axios from "axios"

import { visuallyHidden } from "@mui/utils"
import { useContext } from "react"
import { BranchContext } from "../../../contexts/BranchContext"
import { UserContext } from "../../../contexts/UserContext"

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

const headCells = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Name",
  },
  {
    id: "branch",
    numeric: true,
    disablePadding: false,
    label: "Branch",
  },
  {
    id: "student",
    numeric: true,
    disablePadding: false,
    label: "Student",
  },
]

function EnhancedTableHead(props) {
  const {
    // onSelectAllClick,
    order,
    orderBy,
    // numSelected,
    // rowCount,
    onRequestSort,
  } = props
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            width="300px"
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
}

function EnhancedTableToolbar(props) {
  const { numSelected } = props

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        bgcolor: "#1976d2",
        color: "white",
        borderRadius: "5px 5px 0 0",
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Instructors
        </Typography>
      )}
      <AddInstructor />
    </Toolbar>
  )
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
}

export default function EnhancedTable() {
  const [open, setOpen] = useState(false)
  const handleClose = () => setOpen(false)
  const [order, setOrder] = React.useState("asc")
  const [orderBy, setOrderBy] = React.useState("calories")
  const [selected, setSelected] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [rows, setRows] = useState([])
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const { branch } = useContext(BranchContext)
  const { user } = useContext(UserContext)
  const _ = require("lodash")

  const [instructorName, setInstructorName] = useState(null)
  const [email, setEmail] = useState(null)
  const [instructorBranch, setInstructorBranch] = useState(null)
  const [gender, setGender] = useState(null)
  const [studentNames, setStudentNames] = useState([])
  const [birthDate, setBirthdate] = useState(null)
  const [contactNo, setContactNo] = useState(null)
  const [address, setAddress] = useState(null)

  const handleOpen = (data) => {
    setInstructorName(
      data.firstName + " " + data.middleName + " " + data.lastName
    )
    setEmail(data.email)
    setInstructorBranch(data.branch)
    setGender(data.gender)
    setBirthdate(data.birthDate)
    setContactNo(data.contactNo)
    setAddress(data.address)
    setStudentNames(data.studentNames)
    setOpen(true)
  }

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    width: "450px",
    borderRadius: "10px",
    boxShadow: 24,
    p: "24px",
  }

  // Fetch Instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      let response
      let response2

      if (user.type == "Admin") {
        response = await axios.get(
          `${process.env.REACT_APP_URL}/branches/${branch.name}/Instructor`
        )

        // Process data
        response.data.forEach((element, index) => {
          element.branch = element.branches.join(", ")
          element.studentNames = element.students.map(
            (student) =>
              (student.studentFullName =
                student.firstName + " " + student.lastName)
          )
        })

        setRows(response.data)

        if (response) setIsTableLoading(false)

        console.log(response)
      }

      if (user.type == "Student") {
        response = await axios.get(
          `${process.env.REACT_APP_URL}/users/${user.id}`
        )

        response2 = await axios.get(
          `${process.env.REACT_APP_URL}/users/${response.data.instructorId}`
        )

        setRows([response2.data])
        console.log(response2.data)

        if (response) setIsTableLoading(false)
      }
    }

    fetchInstructors()
  }, [branch])

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.name)
      setSelected(newSelected)
      return
    }
    setSelected([])
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // const handleChangeDense = (event) => {
  //   setDense(event.target.checked)
  // }

  const isSelected = (name) => selected.indexOf(name) !== -1

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }} elevation={1}>
        <EnhancedTableToolbar numSelected={selected.length} />
        {isTableLoading && <LinearProgress />}
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.sort(getComparator(order, orderBy)).slice() */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.name)
                  const labelId = `enhanced-table-checkbox-${index}`

                  return (
                    <TableRow
                      hover
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      onClick={() => {
                        handleOpen(row)
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell component="th" id={labelId} scope="row">
                        {["Instructor", "Admin"].includes(user.type)
                          ? row.fullName
                          : row.firstName + " " + row.lastName}
                      </TableCell>
                      <TableCell align="left">
                        {["Instructor", "Admin"].includes(user.type)
                          ? row.branch
                          : row.branches.join(", ")}
                      </TableCell>
                      <TableCell align="left">
                        {["Instructor", "Admin"].includes(user.type)
                          ? row.studentNames[0]
                          : user.firstName + " " + user.lastName}
                      </TableCell>
                    </TableRow>
                  )
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Box>
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
                Instructor Information
              </Typography>

              <IconButton onClick={handleClose}>
                <Close />
              </IconButton>
            </Box>
            <Divider sx={{ marginTop: "24px" }} />

            <Box mt={"12px"} textAlign={"center"}>
              <Box>
                <Typography variant="h6">{instructorName}</Typography>
              </Box>
              <Box>
                <Typography variant="p">{email}</Typography>
              </Box>
              <Box>
                <Typography variant="p">{instructorBranch} Branch</Typography>
              </Box>
            </Box>

            <Divider sx={{ marginTop: "24px" }} />

            <Box
              mt={"12px"}
              display={"flex"}
              gap={"12px"}
              justifyContent={"space-between"}
              alignItems={"top"}
            >
              <Box flex={1}>
                <Box>
                  <Typography variant="p">Gender</Typography>
                </Box>
              </Box>

              <Box flex={3}>
                <Typography variant="p">{gender}</Typography>
              </Box>
            </Box>

            <Box
              mt={"8px"}
              display={"flex"}
              gap={"12px"}
              justifyContent={"space-between"}
              alignItems={"top"}
            >
              <Box flex={1}>
                <Box>
                  <Typography variant="p">Birthdate</Typography>
                </Box>
              </Box>

              <Box flex={3}>
                <Typography variant="p">
                  {new Date(birthDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            <Box
              display={"flex"}
              gap={"12px"}
              justifyContent={"space-between"}
              alignItems={"top"}
              mt={"8px"}
            >
              <Box flex={1}>
                <Box>
                  <Typography variant="p">Contact No.</Typography>
                </Box>
              </Box>

              <Box flex={3}>
                <Typography variant="p">{contactNo}</Typography>
              </Box>
            </Box>

            <Box
              display={"flex"}
              gap={"12px"}
              justifyContent={"space-between"}
              alignItems={"top"}
              mt={"8px"}
            >
              <Box flex={1}>
                <Box>
                  <Typography variant="p">Address</Typography>
                </Box>
              </Box>

              <Box flex={3}>
                <Typography variant="p">{address}</Typography>
              </Box>
            </Box>

            <Divider sx={{ marginTop: "24px" }} />

            <Box mt={"12px"} textAlign={"center"} mb={"12px"}>
              <Box>
                <Box>
                  <Typography variant="h6">Students</Typography>
                </Box>
              </Box>

              {studentNames.map((student) => (
                <Box>
                  <Typography variant="p">{student}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  )
}
