import React, { useEffect, useState, useMemo } from "react";
import useStateContext from "../hooks/useStateContext";
import { BASE_URL, ENDPOINTS, createAPIEndpoint } from "../api";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  CardHeader,
  Box,
  LinearProgress,
  CardMedia,
  Radio,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { getFormatedTime } from "../helper";
import { useNavigate } from "react-router-dom";

export default function Quiz() {
  const [qns, setQns] = useState([]);
  const [qnIndex, setQnIndex] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const { context, setContext } = useStateContext();
  const [error, setError] = useState(null);
  const [openPrompt, setOpenPrompt] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const navigate = useNavigate();

  let timer;

  const startTimer = () => {
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      setTimeTaken((prev) => prev + 1);
    }, [1000]);
  };

  useEffect(() => {
    setContext({
      timeTaken: 0,
      selectedOptions: [],
    });

    createAPIEndpoint(ENDPOINTS.question)
      .fetch()
      .then((res) => {
        setQns(res.data);
        startTimer();
      })
      .catch((err) => {
        console.error("Failed to Fetch Questions", err);
        setError(new Error("Failed to Fetch Questions"));
      });

    return () => {
      clearInterval(timer);
    };
  }, []);

  const updateAnswer = (qnId, optionIdx) => {
    const temp = [...context.selectedOptions];
    const existingAnswerIndex = temp.findIndex((x) => x.qnId === qnId);

    if (existingAnswerIndex !== -1) {
      temp[existingAnswerIndex].selected = optionIdx;
    } else {
      temp.push({
        qnId,
        selected: optionIdx,
      });
    }

    setContext({ selectedOptions: [...temp] });
  };

  const handleNext = () => {
    if (qnIndex < qns.length - 1) {
      setQnIndex(qnIndex + 1);
    } else {
      const unAnswered = validateAllAnswered();
      if (unAnswered.length > 0) {
        setUnansweredQuestions(unAnswered);
        setOpenPrompt(true);
      } else {
        setContext({ ...context, timeTaken });
        navigate("/result");
      }
    }
  };

  const validateAllAnswered = () => {
    const unanswered = [];
    qns.forEach((question, index) => {
      const isAnswered = context.selectedOptions.some(
        (x) => x.qnId === question.qnId
      );
      if (!isAnswered) {
        unanswered.push(index + 1);
      }
    });
    return unanswered;
  };

  const handleClosePrompt = () => {
    setOpenPrompt(false);
  };

  const navigateToQuestion = (questionNumber) => {
    setQnIndex(questionNumber - 1);
    setOpenPrompt(false);
  };

  const handlePrevious = () => {
    if (qnIndex > 0) {
      setQnIndex(qnIndex - 1);
    }
  };

  const getSelectedAnswer = (qnId) => {
    return context.selectedOptions.find((x) => x.qnId === qnId)?.selected;
  };

  if (error) {
    throw error;
  }

  const currentQuestionOptions = useMemo(() => {
    return qns.length ? qns[qnIndex].options : [];
  }, [qns, qnIndex]);

  return qns.length !== 0 ? (
    <>
      <Card
        sx={{
          maxWidth: 640,
          mx: "auto",
          mt: 5,
          "& .MuiCardHeader-action": { m: 0, alignSelf: "center" },
        }}
      >
        <CardHeader
          title={"Question " + (qnIndex + 1) + " of " + qns.length}
          action={<Typography>{getFormatedTime(timeTaken)}</Typography>}
        />
        <Box>
          <LinearProgress
            variant="determinate"
            value={((qnIndex + 1) * 100) / qns.length}
          />
        </Box>
        {qns[qnIndex].imageName !== null ? (
          <CardMedia
            component="img"
            image={BASE_URL + "images/" + qns[qnIndex].imageName}
            sx={{ width: "auto", m: "10px auto" }}
          />
        ) : null}
        <CardContent>
          <Typography variant="h6">{qns[qnIndex].qnInWords}</Typography>
          <List>
            {currentQuestionOptions.map((item, idx) => (
              <ListItemButton
                disableRipple
                key={idx}
                onClick={() => updateAnswer(qns[qnIndex].qnId, idx)}
              >
                <Radio
                  checked={getSelectedAnswer(qns[qnIndex].qnId) === idx}
                  onChange={() => updateAnswer(qns[qnIndex].qnId, idx)}
                />
                <div>
                  <b>{String.fromCharCode(65 + idx) + " . "}</b>
                  {item}
                </div>
              </ListItemButton>
            ))}
          </List>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            sx={{ mt: 2 }}
          >
            <Button
              variant="contained"
              disabled={qnIndex === 0}
              onClick={handlePrevious}
            >
              Previous
            </Button>
            <Button variant="contained" onClick={handleNext}>
              {qnIndex === qns.length - 1 ? "Finish" : "Next"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Dialog open={openPrompt} onClose={handleClosePrompt}>
        <DialogTitle>Unanswered Questions</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please answer all questions before submitting. The following
            questions are unanswered:
            <Box component="ul" sx={{ mt: 1 }}>
              {unansweredQuestions.map((qNum) => (
                <li key={qNum}>
                  <Button
                    color="primary"
                    onClick={() => navigateToQuestion(qNum)}
                  >
                    Question {qNum}
                  </Button>
                </li>
              ))}
            </Box>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrompt}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  ) : null;
}
