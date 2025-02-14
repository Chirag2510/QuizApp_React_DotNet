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
} from "@mui/material";
import { getFormatedTime } from "../helper";
import { useNavigate } from "react-router-dom";

export default function Quiz() {
  const [qns, setQns] = useState([]);
  const [qnIndex, setQnIndex] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const { context, setContext } = useStateContext();
  const [error, setError] = useState(null);
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
    temp.push({
      qnId,
      selected: optionIdx,
    });

    if (qnIndex < qns.length - 1) {
      setContext({ selectedOptions: [...temp] });
      setQnIndex(qnIndex + 1);
    } else {
      setContext({ selectedOptions: [...temp], timeTaken });
      navigate("/result");
    }
  };

  if (error) {
    throw error;
  }

  const currentQuestionOptions = useMemo(() => {
    return qns.length ? qns[qnIndex].options : [];
  }, [qns, qnIndex]);

  return qns.length !== 0 ? (
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
              <div>
                <b>{String.fromCharCode(65 + idx) + " . "}</b>
                {item}
              </div>
            </ListItemButton>
          ))}
        </List>
      </CardContent>
    </Card>
  ) : null;
}
