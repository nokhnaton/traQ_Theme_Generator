type RGB = {
  red: number;
  blue: number;
  green: number;
};

type RGBList = {
  data: RGB[][];
  width: number;
  height: number;
};

const imageDataToRGBList = async (imgData: ImageData): Promise<RGBList> => {
  const rgbList: RGBList = {
    data: [[]],
    width: imgData.width,
    height: imgData.height,
  };

  const data = imgData.data;
  for (var i = 0; i < data.length; i += 4) {
    const i_div_4 = i / 4;
    if (i_div_4 % imgData.width == 0)
      rgbList.data[Math.floor(i_div_4 / imgData.width)] = [];
    rgbList.data[Math.floor(i_div_4 / imgData.width)][i_div_4 % imgData.width] =
      {
        red: data[i],
        green: data[i + 1],
        blue: data[i + 2],
      };
  }
  return rgbList;
};

const rgbListToImageData = async (rgbList: RGBList): Promise<ImageData> => {
  const imgData = new ImageData(rgbList.width, rgbList.height);
  const data = imgData.data;

  for (let i = 0; i < rgbList.height; i++) {
    for (let j = 0; j < rgbList.width; j++) {
      const rgb = rgbList.data[i][j];
      const offset = (i * rgbList.width + j) * 4;
      data[offset] = rgb.red;
      data[offset + 1] = rgb.green;
      data[offset + 2] = rgb.blue;
      data[offset + 3] = 255;
    }
  }

  return imgData;
};

const kMeans = (
  n: number,
  rgb2dList: RGBList
): {
  classList: { rgb: RGB; matchLength: number }[];
  rgb2dListKMean: RGBList;
} => {
  const getNearClass = (rgb: RGB) => {
    let classNum = 0;
    let minD = 255 * 255 * 3;
    for (let i = 0; i < points.length; i++) {
      const d = rgbDistance(rgb, points[i]);
      if (d < minD) {
        minD = d;
        classNum = i;
      }
    }
    return classNum;
  };

  const meanRGBList = (rgbList: RGB[]) => {
    const addRGB = (a: RGB, b: RGB) => ({
      red: a.red + b.red,
      blue: a.blue + b.blue,
      green: a.green + b.green,
    });
    const rgbSum = rgbList.reduce(addRGB, { red: 0, blue: 0, green: 0 });
    return {
      red: rgbSum.red / rgbList.length,
      blue: rgbSum.blue / rgbList.length,
      green: rgbSum.green / rgbList.length,
    };
  };

  const rgbDistance = (a: RGB, b: RGB): number =>
    (a.red - b.red) ** 2 + (a.blue - b.blue) ** 2 + (a.green - b.green) ** 2;

  const sliceByNumber = (array: RGB[], number: number) => {
    const length = Math.ceil(array.length / number);
    return Array.from({ length }).map((_, i) =>
      array.slice(i * number, (i + 1) * number)
    );
  };

  let rgbList = rgb2dList.data
    .flat()
    .map((v) => ({ rgb: v, class: 0, notChange: true }));
  let points = Array.from(
    { length: n },
    () => rgbList[Math.floor(Math.random() * rgbList.length)].rgb
  );

  for (let i = 0; i < 100; i++) {
    console.log(i);
    rgbList = rgbList.map((v) => {
      const nearClass = getNearClass(v.rgb);
      return {
        rgb: v.rgb,
        notChange: nearClass === v.class,
        class: nearClass,
      };
    });

    if (rgbList.every((v) => v.notChange)) break;

    points = points.map((_, j) =>
      meanRGBList(rgbList.filter((v) => v.class === j).map((v) => v.rgb))
    );
  }

  const classList = points.map((v, i) => ({
    rgb: {
      red: Math.floor(v.red),
      green: Math.floor(v.green),
      blue: Math.floor(v.blue),
    },
    matchLength: rgbList.filter((v) => v.class === i).length,
  }));

  return {
    classList,
    rgb2dListKMean: {
      data: sliceByNumber(
        rgbList.map((v) => points[v.class]),
        rgb2dList.width
      ),
      width: rgb2dList.width,
      height: rgb2dList.height,
    },
  };
};

export { rgbListToImageData, imageDataToRGBList, kMeans };
export type { RGB };
