// Server-only question bank. Do not expose answer keys through public assets.
export const assessments = [
  {
    "id": "module-1:general",
    "module": "module-1",
    "title": "The editor's mindset",
    "level": 1,
    "track": "general",
    "lessons": [
      "l1m1s1",
      "l1m1s2",
      "l1m1s3",
      "l1m1s4",
      "l1m1s5"
    ],
    "questions": [
      {
        "prompt": "What should drive the decision to cut first?",
        "options": [
          "Emotion and performance",
          "A fixed shot length",
          "The number of available transitions"
        ],
        "answer": 0
      },
      {
        "prompt": "What does bitrate measure?",
        "options": [
          "Data per second",
          "Images per second",
          "The width of the frame"
        ],
        "answer": 0
      },
      {
        "prompt": "Which pair contains video containers?",
        "options": [
          "MP4 and MOV",
          "H.264 and HEVC",
          "ProRes and DNxHR"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-2:fcp",
    "module": "module-2",
    "title": "First edit in both apps",
    "level": 1,
    "track": "fcp",
    "lessons": [
      "l1m2s1"
    ],
    "questions": [
      {
        "prompt": "Where should you build the main story in FCP?",
        "options": [
          "The primary storyline",
          "The effects browser",
          "The export queue"
        ],
        "answer": 0
      },
      {
        "prompt": "What is the usual workflow?",
        "options": [
          "Import, organise, edit, refine, export",
          "Export before importing",
          "Grade before choosing footage"
        ],
        "answer": 0
      },
      {
        "prompt": "How does FCP normally save edits?",
        "options": [
          "Automatically as you work",
          "Only when you export",
          "Only when you close a library"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-2:resolve",
    "module": "module-2",
    "title": "First edit in both apps",
    "level": 1,
    "track": "resolve",
    "lessons": [
      "l1m2s2"
    ],
    "questions": [
      {
        "prompt": "Which Resolve page is used for final rendering?",
        "options": [
          "Deliver",
          "Media",
          "Fairlight"
        ],
        "answer": 0
      },
      {
        "prompt": "Which page focuses on audio?",
        "options": [
          "Fairlight",
          "Color",
          "Fusion"
        ],
        "answer": 0
      },
      {
        "prompt": "Which page focuses on compositing?",
        "options": [
          "Fusion",
          "Deliver",
          "Media"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-2:premiere",
    "module": "module-2",
    "title": "First edit in both apps",
    "level": 1,
    "track": "premiere",
    "lessons": [
      "premiere-m2"
    ],
    "questions": [
      {
        "prompt": "Where do you organise imported clips?",
        "options": [
          "Project panel bins",
          "The export destination folder only",
          "The audio meter"
        ],
        "answer": 0
      },
      {
        "prompt": "What holds your edited timeline?",
        "options": [
          "A sequence",
          "A video thumbnail",
          "A codec"
        ],
        "answer": 0
      },
      {
        "prompt": "What follows export?",
        "options": [
          "Playback and quality checks of the exported file",
          "Immediate deletion of all sources",
          "Assuming the preset guarantees correctness"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-3:fcp",
    "module": "module-3",
    "title": "Organise like a professional",
    "level": 1,
    "track": "fcp",
    "lessons": [
      "l1m3s1",
      "l1m3s2",
      "l1m3s3"
    ],
    "questions": [
      {
        "prompt": "What is the FCP organisation hierarchy?",
        "options": [
          "Library, event, project",
          "Project, library, event",
          "Event, project, library"
        ],
        "answer": 0
      },
      {
        "prompt": "What is proxy media for?",
        "options": [
          "Smoother editing with lighter media",
          "Replacing the final master permanently",
          "Increasing the original recording resolution"
        ],
        "answer": 0
      },
      {
        "prompt": "What should you reconnect before final quality export?",
        "options": [
          "Original or optimised media",
          "Only thumbnail images",
          "Only offline proxy placeholders"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-3:resolve",
    "module": "module-3",
    "title": "Organise like a professional",
    "level": 1,
    "track": "resolve",
    "lessons": [
      "l1m3s4",
      "l1m3s5"
    ],
    "questions": [
      {
        "prompt": "Where do you organise source clips?",
        "options": [
          "Media Pool bins",
          "The render queue",
          "The Color wheels"
        ],
        "answer": 0
      },
      {
        "prompt": "When should project frame rate be checked?",
        "options": [
          "Before building the edit",
          "Only after rendering",
          "Only when adding titles"
        ],
        "answer": 0
      },
      {
        "prompt": "What is a project backup for?",
        "options": [
          "Recovering an earlier project state",
          "Increasing clip resolution",
          "Replacing all source media"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-3:general",
    "module": "module-3",
    "title": "Organise like a professional",
    "level": 1,
    "track": "general",
    "lessons": [
      "l1m3s6"
    ],
    "questions": [
      {
        "prompt": "What makes a useful project folder structure?",
        "options": [
          "Clearly labelled media and project folders",
          "Keeping everything in Downloads",
          "Renaming files at random"
        ],
        "answer": 0
      },
      {
        "prompt": "Where should a backup be kept?",
        "options": [
          "On a separate storage device or location",
          "Only next to the original on the same drive",
          "Only inside the current timeline"
        ],
        "answer": 0
      },
      {
        "prompt": "Why organise footage before editing?",
        "options": [
          "To find and manage media reliably",
          "To increase the recording frame rate",
          "To change the camera sensor size"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-3:premiere",
    "module": "module-3",
    "title": "Organise like a professional",
    "level": 1,
    "track": "premiere",
    "lessons": [
      "premiere-m3"
    ],
    "questions": [
      {
        "prompt": "What are proxies for?",
        "options": [
          "Responsive editing with lighter files",
          "Replacing the camera originals permanently",
          "Increasing camera resolution"
        ],
        "answer": 0
      },
      {
        "prompt": "How should project media be organised?",
        "options": [
          "Consistent bins and folders",
          "One unlabelled pile of files",
          "Only by random filenames"
        ],
        "answer": 0
      },
      {
        "prompt": "What is needed for full quality delivery?",
        "options": [
          "Available original media and correct export settings",
          "Only proxy thumbnails",
          "Only the project icon"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-4:fcp",
    "module": "module-4",
    "title": "Cutting with speed and precision",
    "level": 1,
    "track": "fcp",
    "lessons": [
      "l1m4s1",
      "l1m4s2",
      "l1m4s3"
    ],
    "questions": [
      {
        "prompt": "What happens when you ripple trim in the primary storyline?",
        "options": [
          "Later clips shift with the changed duration",
          "The whole project keeps the same duration",
          "Only the clip colour changes"
        ],
        "answer": 0
      },
      {
        "prompt": "What anchors a connected clip?",
        "options": [
          "Its connection point in the primary storyline",
          "The export preset",
          "The library name"
        ],
        "answer": 0
      },
      {
        "prompt": "What does a slip edit change?",
        "options": [
          "The source range within a clip without moving its timeline position",
          "The project frame rate",
          "The entire timeline duration"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-4:resolve",
    "module": "module-4",
    "title": "Cutting with speed and precision",
    "level": 1,
    "track": "resolve",
    "lessons": [
      "l1m4s4",
      "l1m4s5",
      "l1m4s6"
    ],
    "questions": [
      {
        "prompt": "What does a ripple trim change?",
        "options": [
          "Timeline duration as later clips shift",
          "Only the export codec",
          "Only the track name"
        ],
        "answer": 0
      },
      {
        "prompt": "What does a roll edit change?",
        "options": [
          "The cut point between two adjacent clips",
          "The overall duration of the pair",
          "The project resolution"
        ],
        "answer": 0
      },
      {
        "prompt": "Why check track targeting?",
        "options": [
          "To control which tracks receive an edit",
          "To select the export destination",
          "To set the audio sample rate"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-4:general",
    "module": "module-4",
    "title": "Cutting with speed and precision",
    "level": 1,
    "track": "general",
    "lessons": [
      "l1m4s7",
      "l1m4s8",
      "l1m4s9"
    ],
    "questions": [
      {
        "prompt": "What does a J cut do?",
        "options": [
          "Starts incoming audio before its picture",
          "Starts incoming picture before its audio",
          "Reverses both clips"
        ],
        "answer": 0
      },
      {
        "prompt": "What does a roll trim preserve?",
        "options": [
          "Combined duration of the adjacent clips",
          "The original cut position",
          "The position of every audio keyframe"
        ],
        "answer": 0
      },
      {
        "prompt": "Why cut on action?",
        "options": [
          "Movement helps conceal the edit",
          "It guarantees a smaller file",
          "It removes the need for sound"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-4:premiere",
    "module": "module-4",
    "title": "Cutting with speed and precision",
    "level": 1,
    "track": "premiere",
    "lessons": [
      "premiere-m4"
    ],
    "questions": [
      {
        "prompt": "What does a rolling edit preserve?",
        "options": [
          "Combined duration of adjacent clips",
          "The original cut position",
          "The source In point of both clips"
        ],
        "answer": 0
      },
      {
        "prompt": "What does a ripple edit do?",
        "options": [
          "Shifts following clips as duration changes",
          "Only changes the clip name",
          "Only changes the export format"
        ],
        "answer": 0
      },
      {
        "prompt": "Why check track targeting?",
        "options": [
          "To control the tracks affected by an edit",
          "To pick the output filename",
          "To choose a camera lens"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-5:fcp",
    "module": "module-5",
    "title": "Multicam and complex timelines",
    "level": 2,
    "track": "fcp",
    "lessons": [
      "l2m1s1",
      "l2m1s2",
      "l2m1s3"
    ],
    "questions": [
      {
        "prompt": "What is a multicam angle viewer used for?",
        "options": [
          "Choosing between synchronised camera angles",
          "Changing the recording codec",
          "Generating project backups"
        ],
        "answer": 0
      },
      {
        "prompt": "What makes camera angle changes continuous?",
        "options": [
          "Synchronised footage on a common timeline",
          "Different frame rates in every angle",
          "Randomly offsetting camera audio"
        ],
        "answer": 0
      },
      {
        "prompt": "What should be checked after switching angles?",
        "options": [
          "Picture continuity and the intended audio source",
          "Only the library icon",
          "Only the export filename"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-5:resolve",
    "module": "module-5",
    "title": "Multicam and complex timelines",
    "level": 2,
    "track": "resolve",
    "lessons": [
      "l2m1s4"
    ],
    "questions": [
      {
        "prompt": "What helps synchronise multicam clips?",
        "options": [
          "Matching timecode or recorded audio",
          "Matching filenames alone",
          "Identical clip thumbnails"
        ],
        "answer": 0
      },
      {
        "prompt": "What does the multicam viewer let you choose?",
        "options": [
          "The active camera angle",
          "The original camera aperture",
          "The storage device speed"
        ],
        "answer": 0
      },
      {
        "prompt": "Why keep one consistent audio source across cuts?",
        "options": [
          "To avoid jumps in dialogue and room sound",
          "To increase image resolution",
          "To change camera synchronisation"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-5:premiere",
    "module": "module-5",
    "title": "Multicam and complex timelines",
    "level": 2,
    "track": "premiere",
    "lessons": [
      "premiere-m5"
    ],
    "questions": [
      {
        "prompt": "What can synchronise camera angles?",
        "options": [
          "Matching audio or timecode",
          "Thumbnail colours alone",
          "Random file ordering"
        ],
        "answer": 0
      },
      {
        "prompt": "What does multicamera viewing control?",
        "options": [
          "The active camera angle",
          "The recording resolution",
          "The camera lens aperture"
        ],
        "answer": 0
      },
      {
        "prompt": "What needs review after switching cameras?",
        "options": [
          "Picture continuity and the intended audio",
          "Only the project icon",
          "Only the file creation time"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-6:general",
    "module": "module-6",
    "title": "Sound: half of every video",
    "level": 2,
    "track": "general",
    "lessons": [
      "l2m2s1",
      "l2m2s6"
    ],
    "questions": [
      {
        "prompt": "What should remain clear in a dialogue-led mix?",
        "options": [
          "The spoken voice",
          "Only the background music",
          "Only the loudest sound effect"
        ],
        "answer": 0
      },
      {
        "prompt": "What is room tone useful for?",
        "options": [
          "Bridging edits in background ambience",
          "Replacing all spoken words",
          "Correcting white balance"
        ],
        "answer": 0
      },
      {
        "prompt": "What should you check beyond peak levels?",
        "options": [
          "Perceived loudness and consistency",
          "Only the project name",
          "Only the video frame size"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-6:fcp",
    "module": "module-6",
    "title": "Sound: half of every video",
    "level": 2,
    "track": "fcp",
    "lessons": [
      "l2m2s2",
      "l2m2s3"
    ],
    "questions": [
      {
        "prompt": "What are audio roles useful for?",
        "options": [
          "Organising and delivering different sound categories",
          "Changing camera frame rate",
          "Replacing all audio with a stereo image"
        ],
        "answer": 0
      },
      {
        "prompt": "How should you use noise reduction?",
        "options": [
          "Apply enough to improve clarity and listen for artifacts",
          "Always set it to maximum",
          "Apply it without monitoring"
        ],
        "answer": 0
      },
      {
        "prompt": "What do volume keyframes control?",
        "options": [
          "Level changes over time",
          "The video resolution",
          "The clip container"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-6:resolve",
    "module": "module-6",
    "title": "Sound: half of every video",
    "level": 2,
    "track": "resolve",
    "lessons": [
      "l2m2s4",
      "l2m2s5"
    ],
    "questions": [
      {
        "prompt": "Which Resolve page provides detailed audio mixing?",
        "options": [
          "Fairlight",
          "Media",
          "Deliver"
        ],
        "answer": 0
      },
      {
        "prompt": "What does EQ adjust?",
        "options": [
          "The balance of frequency ranges",
          "The picture aspect ratio",
          "The video frame rate"
        ],
        "answer": 0
      },
      {
        "prompt": "Why use compression on dialogue carefully?",
        "options": [
          "To control dynamics while keeping speech natural",
          "To increase image sharpness",
          "To remove the need for gain staging"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-6:premiere",
    "module": "module-6",
    "title": "Sound: half of every video",
    "level": 2,
    "track": "premiere",
    "lessons": [
      "premiere-m6"
    ],
    "questions": [
      {
        "prompt": "What should lead a dialogue-led mix?",
        "options": [
          "Intelligible speech",
          "The loudest possible music",
          "Identical gain for every clip"
        ],
        "answer": 0
      },
      {
        "prompt": "What does EQ affect?",
        "options": [
          "Frequency balance",
          "Frame size",
          "Frame rate"
        ],
        "answer": 0
      },
      {
        "prompt": "How should noise reduction be applied?",
        "options": [
          "Carefully while listening for artifacts",
          "At maximum on every clip",
          "Without listening to the result"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-7:fcp",
    "module": "module-7",
    "title": "Titles, captions and motion",
    "level": 2,
    "track": "fcp",
    "lessons": [
      "l2m3s1",
      "l2m3s2",
      "l2m3s3",
      "l2m3s4"
    ],
    "questions": [
      {
        "prompt": "What should a lower third prioritise?",
        "options": [
          "Readable information inside safe areas",
          "The largest possible animation",
          "Covering the speaker’s face"
        ],
        "answer": 0
      },
      {
        "prompt": "What do title keyframes control?",
        "options": [
          "Changes in title properties over time",
          "The original camera exposure",
          "The recording format"
        ],
        "answer": 0
      },
      {
        "prompt": "What must be checked in automatic captions?",
        "options": [
          "Spelling, timing and speaker names",
          "Only the caption background colour",
          "Only the file creation date"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-7:resolve",
    "module": "module-7",
    "title": "Titles, captions and motion",
    "level": 2,
    "track": "resolve",
    "lessons": [
      "l2m3s5",
      "l2m3s6",
      "l2m3s7",
      "l2m3s8"
    ],
    "questions": [
      {
        "prompt": "Which workspace is used for advanced title compositing?",
        "options": [
          "Fusion",
          "Media",
          "Deliver"
        ],
        "answer": 0
      },
      {
        "prompt": "What is Text+ used for?",
        "options": [
          "Styled and animated text",
          "Audio noise reduction",
          "Generating proxy media"
        ],
        "answer": 0
      },
      {
        "prompt": "What should be reviewed before caption delivery?",
        "options": [
          "Accuracy, timing and safe placement",
          "Only the render queue position",
          "Only the project folder name"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-7:premiere",
    "module": "module-7",
    "title": "Titles, captions and motion",
    "level": 2,
    "track": "premiere",
    "lessons": [
      "premiere-m7"
    ],
    "questions": [
      {
        "prompt": "What needs review in automatic captions?",
        "options": [
          "Text accuracy and timing",
          "Only the project filename",
          "Only the media duration"
        ],
        "answer": 0
      },
      {
        "prompt": "Where should essential text stay?",
        "options": [
          "Inside safe areas",
          "Outside the picture edges",
          "Over every face"
        ],
        "answer": 0
      },
      {
        "prompt": "What should drive title design?",
        "options": [
          "Readability and the purpose of the message",
          "Maximum animation in every frame",
          "The longest possible text"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-8:fcp",
    "module": "module-8",
    "title": "Effects, masking and compositing",
    "level": 2,
    "track": "fcp",
    "lessons": [
      "l2m4s1",
      "l2m4s2",
      "l2m4s3",
      "l2m4s4"
    ],
    "questions": [
      {
        "prompt": "What does a mask control?",
        "options": [
          "The area affected or revealed",
          "The project frame rate",
          "The audio sample rate"
        ],
        "answer": 0
      },
      {
        "prompt": "Why track a mask?",
        "options": [
          "To follow a moving subject",
          "To rename source files",
          "To change the camera codec"
        ],
        "answer": 0
      },
      {
        "prompt": "What should you check after stabilisation?",
        "options": [
          "Cropping and unwanted image distortion",
          "Only the output filename",
          "Only the audio peak level"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-8:resolve",
    "module": "module-8",
    "title": "Effects, masking and compositing",
    "level": 2,
    "track": "resolve",
    "lessons": [
      "l2m4s5",
      "l2m4s6",
      "l2m4s7",
      "l2m4s8"
    ],
    "questions": [
      {
        "prompt": "How are many Fusion effects connected?",
        "options": [
          "Through nodes",
          "Through audio roles",
          "Through camera menus"
        ],
        "answer": 0
      },
      {
        "prompt": "Why use tracking with an effect?",
        "options": [
          "To follow movement across frames",
          "To create an automatic backup",
          "To increase the recording bitrate"
        ],
        "answer": 0
      },
      {
        "prompt": "What should you review after applying an effect?",
        "options": [
          "Edges, motion and artifacts throughout the shot",
          "Only the first thumbnail",
          "Only the media file extension"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-8:premiere",
    "module": "module-8",
    "title": "Effects, masking and compositing",
    "level": 2,
    "track": "premiere",
    "lessons": [
      "premiere-m8"
    ],
    "questions": [
      {
        "prompt": "What do keyframes define?",
        "options": [
          "Property values at points in time",
          "The camera codec",
          "The folder structure"
        ],
        "answer": 0
      },
      {
        "prompt": "What does an effect mask limit?",
        "options": [
          "The region affected",
          "The project duration",
          "The render filename"
        ],
        "answer": 0
      },
      {
        "prompt": "What needs checking after stabilisation?",
        "options": [
          "Cropping and distortion",
          "Only the clip name",
          "Only the audio format"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-9:general",
    "module": "module-9",
    "title": "Colour correction and grading",
    "level": 3,
    "track": "general",
    "lessons": [
      "l3m1s1",
      "l3m1s2",
      "l3m1s12"
    ],
    "questions": [
      {
        "prompt": "What should come before a creative colour look?",
        "options": [
          "Correcting exposure, white balance and shot matching",
          "Adding the strongest LUT first",
          "Exporting without comparing shots"
        ],
        "answer": 0
      },
      {
        "prompt": "What does a waveform help evaluate?",
        "options": [
          "Image luminance levels",
          "Dialogue word count",
          "Folder size"
        ],
        "answer": 0
      },
      {
        "prompt": "Why match adjacent shots?",
        "options": [
          "To keep colour and exposure consistent",
          "To make every file the same size",
          "To change the timeline frame rate"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-9:fcp",
    "module": "module-9",
    "title": "Colour correction and grading",
    "level": 3,
    "track": "fcp",
    "lessons": [
      "l3m1s3",
      "l3m1s4",
      "l3m1s5"
    ],
    "questions": [
      {
        "prompt": "What should you use alongside your eyes for colour checks?",
        "options": [
          "Video scopes",
          "Only the project name",
          "Only the thumbnail size"
        ],
        "answer": 0
      },
      {
        "prompt": "How should a LUT be used?",
        "options": [
          "After checking its intended input and adjusting the result",
          "As a guaranteed fix for every shot",
          "As a replacement for exposure correction"
        ],
        "answer": 0
      },
      {
        "prompt": "What should you compare when balancing shots?",
        "options": [
          "Exposure, white balance and skin tones",
          "Only clip filenames",
          "Only clip lengths"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-9:resolve",
    "module": "module-9",
    "title": "Colour correction and grading",
    "level": 3,
    "track": "resolve",
    "lessons": [
      "l3m1s6",
      "l3m1s7",
      "l3m1s8",
      "l3m1s9",
      "l3m1s10",
      "l3m1s11"
    ],
    "questions": [
      {
        "prompt": "What do serial colour nodes allow?",
        "options": [
          "A sequence of separate grading operations",
          "A new camera recording format",
          "Automatic dialogue transcription only"
        ],
        "answer": 0
      },
      {
        "prompt": "Why separate correction and look into nodes?",
        "options": [
          "To adjust and diagnose each operation clearly",
          "To eliminate the need for scopes",
          "To guarantee a smaller render"
        ],
        "answer": 0
      },
      {
        "prompt": "What should be checked before applying a transform or LUT?",
        "options": [
          "The input colour space and intended output",
          "Only the clip name",
          "Only the number of audio tracks"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-9:premiere",
    "module": "module-9",
    "title": "Colour correction and grading",
    "level": 3,
    "track": "premiere",
    "lessons": [
      "premiere-m9"
    ],
    "questions": [
      {
        "prompt": "What comes before the creative look?",
        "options": [
          "Exposure and white balance correction",
          "The strongest LUT on every clip",
          "Deleting the original media"
        ],
        "answer": 0
      },
      {
        "prompt": "What helps check luminance?",
        "options": [
          "Lumetri scopes",
          "The audio mixer",
          "The project folder"
        ],
        "answer": 0
      },
      {
        "prompt": "Why compare adjacent shots?",
        "options": [
          "For consistent exposure and colour",
          "To equalise file sizes",
          "To change source frame rates"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-10:fcp",
    "module": "module-10",
    "title": "Export and delivery",
    "level": 3,
    "track": "fcp",
    "lessons": [
      "l3m2s1",
      "l3m2s2"
    ],
    "questions": [
      {
        "prompt": "What should be available for a full quality export?",
        "options": [
          "Original or optimised media",
          "Only proxy thumbnails",
          "Only the project screenshot"
        ],
        "answer": 0
      },
      {
        "prompt": "What should you do after exporting?",
        "options": [
          "Play the exported file and check picture, sound and captions",
          "Assume the timeline preview proves the export is correct",
          "Delete all source media immediately"
        ],
        "answer": 0
      },
      {
        "prompt": "What does a vertical version need?",
        "options": [
          "Reframing and checking titles within safe areas",
          "Only a new filename",
          "Stretching the picture horizontally"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-10:resolve",
    "module": "module-10",
    "title": "Export and delivery",
    "level": 3,
    "track": "resolve",
    "lessons": [
      "l3m2s3",
      "l3m2s4"
    ],
    "questions": [
      {
        "prompt": "Which page holds render jobs?",
        "options": [
          "Deliver",
          "Fusion",
          "Media"
        ],
        "answer": 0
      },
      {
        "prompt": "Why check the render range?",
        "options": [
          "To export the intended full sequence or selected range",
          "To change the original camera sensor",
          "To rename the source clips"
        ],
        "answer": 0
      },
      {
        "prompt": "What should be checked after vertical reframing?",
        "options": [
          "Subject position, captions and logos",
          "Only the timeline name",
          "Only the file extension"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-10:premiere",
    "module": "module-10",
    "title": "Export and delivery",
    "level": 3,
    "track": "premiere",
    "lessons": [
      "premiere-m10"
    ],
    "questions": [
      {
        "prompt": "What must match the delivery brief?",
        "options": [
          "Frame size, frame rate and format",
          "Only the project name",
          "Only the folder colour"
        ],
        "answer": 0
      },
      {
        "prompt": "What does a vertical version require?",
        "options": [
          "Reframing subjects and checking text placement",
          "Only changing the filename",
          "Stretching the picture"
        ],
        "answer": 0
      },
      {
        "prompt": "What verifies delivery quality?",
        "options": [
          "Playing the exported file",
          "Looking only at the timeline thumbnail",
          "Checking only file size"
        ],
        "answer": 0
      }
    ]
  },
  {
    "id": "module-11:general",
    "module": "module-11",
    "title": "Working as a professional editor",
    "level": 3,
    "track": "general",
    "lessons": [
      "l3m3s1",
      "l3m3s2",
      "l3m3s3",
      "l3m3s4",
      "l3m3s5"
    ],
    "questions": [
      {
        "prompt": "How should client feedback be collected?",
        "options": [
          "In one place with clear timecodes and versions",
          "Across untracked messages with no version names",
          "Only after final source files are deleted"
        ],
        "answer": 0
      },
      {
        "prompt": "Where should the strongest showreel work appear?",
        "options": [
          "In the first ten seconds",
          "Only after the closing credits",
          "Only in a separate hidden file"
        ],
        "answer": 0
      },
      {
        "prompt": "What belongs in a project quote?",
        "options": [
          "Deliverables, revision rounds and delivery date",
          "Only an unexplained total price",
          "A promise of unlimited work with no deadline"
        ],
        "answer": 0
      }
    ]
  }
];
