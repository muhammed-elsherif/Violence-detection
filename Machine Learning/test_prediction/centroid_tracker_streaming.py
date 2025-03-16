import numpy as np
from collections import OrderedDict
from scipy.spatial import distance as dist

class CentroidTracker:
    def __init__(self, maxDisappeared=10, maxDistance=50):
        self.nextObjectID = 0              # Unique ID for each object
        self.objects = OrderedDict()       # objectID -> centroid (x, y)
        self.bboxes = OrderedDict()        # objectID -> bounding box [x, y, w, h]
        self.disappeared = OrderedDict()   # objectID -> number of consecutive frames missing
        self.maxDisappeared = maxDisappeared
        self.maxDistance = maxDistance     # maximum allowed distance for matching

    def register(self, centroid, bbox):
        self.objects[self.nextObjectID] = (centroid, bbox)
        self.bboxes[self.nextObjectID] = bbox
        self.disappeared[self.nextObjectID] = 0
        self.nextObjectID += 1

    def deregister(self, objectID):
        if objectID in self.objects:
            del self.objects[objectID]
            del self.bboxes[objectID] 
            del self.disappeared[objectID]
        else:
            print(f"Warning: Attempted to deregister non-existing objectID {objectID}")


    def update(self, rects):
        # If no detections, mark existing objects as disappeared.
        if len(rects) == 0:
            for objectID in list(self.disappeared.keys()):
                self.disappeared[objectID] += 1
                if self.disappeared[objectID] > self.maxDisappeared:
                    self.deregister(objectID)
            return self.objects

        centroids = np.array([(int(x + w / 2), int(y + h / 2)) for (x, y, w, h) in rects])
        new_objects = OrderedDict()
        
        for (i, centroid) in enumerate(centroids):
            new_objects[self.nextObjectID] = (centroid, rects[i])
            self.register(centroid, rects[i])

        self.objects = new_objects

        # self.objects = OrderedDict()
        # self.disappeared = OrderedDict()
        # for rect in rects:
        #     centroid = (int(rect[0] + rect[2] / 2), int(rect[1] + rect[3] / 2))
        #     self.objects[self.nextObjectID] = (centroid, rect)
        #     self.disappeared[self.nextObjectID] = 0
        #     self.nextObjectID += 1

        return self.objects
