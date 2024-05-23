use std::collections::LinkedList;

pub struct RunningMax {
    window: usize,
    values: LinkedList<u32>,
}

impl RunningMax {
    pub fn new(window: usize) -> Self {
        return RunningMax {
            window,
            values: LinkedList::new(),
        };
    }

    pub fn push(&mut self, value: u32) -> () {
        self.values.push_back(value);
        while self.values.len() > self.window {
            self.values.pop_front();
        }
    }

    pub fn max(&self) -> u32 {
        return self.values.iter().fold(0, |p, v| p.max(*v));
    }
}
